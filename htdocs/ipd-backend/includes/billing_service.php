<?php
declare(strict_types=1);

function create_billing_record(PDO $pdo, array $payload): array
{
    validate_required_fields($payload, [
        'patient_code' => 'Patient code',
        'items' => 'Billing items',
    ]);

    if (!is_array($payload['items'])) {
        throw new InvalidArgumentException('Billing items must be an array.');
    }

    $pdo->beginTransaction();

    try {
        $patient = ensure_patient_from_payload($pdo, [
            'patientId' => $payload['patient_code'],
            'patientName' => $payload['patient_name'] ?? sprintf('Patient %s', $payload['patient_code']),
        ], [
            'patient_code' => normalize_string($payload['patient_code'], 50),
            'full_name' => normalize_string($payload['patient_name'] ?? null, 200) ?? sprintf('Patient %s', $payload['patient_code']),
        ]);
        $admission = find_admission_by_identifiers($pdo, $payload, (int) $patient['id']);

        $discount = (float) ($payload['discount_amount'] ?? 0);
        $tax = (float) ($payload['tax_amount'] ?? 0);
        $subtotal = 0.0;
        $preparedItems = [];

        foreach ($payload['items'] as $item) {
            $description = normalize_string($item['description'] ?? null, 255);
            if ($description === null) {
                continue;
            }

            $quantity = (float) ($item['quantity'] ?? 1);
            $unitPrice = (float) ($item['unit_price'] ?? 0);
            $lineTax = (float) ($item['tax_amount'] ?? 0);
            $lineTotal = ($quantity * $unitPrice) + $lineTax;

            $preparedItems[] = [
                'category' => normalize_string($item['category'] ?? null, 50),
                'description' => $description,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'tax_amount' => $lineTax,
                'line_total' => $lineTotal,
            ];
            $subtotal += $quantity * $unitPrice;
            $tax += $lineTax;
        }

        if ($preparedItems === []) {
            throw new InvalidArgumentException('At least one valid billing item is required.');
        }

        $total = $subtotal - $discount + $tax;
        $paidAmount = (float) ($payload['payment']['amount'] ?? 0);
        $dueAmount = max($total - $paidAmount, 0);
        $billingStatus = $paidAmount <= 0 ? 'generated' : ($dueAmount > 0 ? 'partially_paid' : 'paid');

        $billingStatement = $pdo->prepare(
            'INSERT INTO billing (
                patient_id, admission_id, bill_no, status, subtotal, discount_amount, tax_amount,
                total_amount, due_amount, notes, generated_at
             ) VALUES (
                :patient_id, :admission_id, :bill_no, :status, :subtotal, :discount_amount, :tax_amount,
                :total_amount, :due_amount, :notes, :generated_at
             )'
        );
        $billingStatement->execute([
            ':patient_id' => $patient['id'],
            ':admission_id' => $admission['id'] ?? null,
            ':bill_no' => generate_reference('BILL'),
            ':status' => $billingStatus,
            ':subtotal' => number_format($subtotal, 2, '.', ''),
            ':discount_amount' => number_format($discount, 2, '.', ''),
            ':tax_amount' => number_format($tax, 2, '.', ''),
            ':total_amount' => number_format($total, 2, '.', ''),
            ':due_amount' => number_format($dueAmount, 2, '.', ''),
            ':notes' => normalize_string($payload['notes'] ?? null),
            ':generated_at' => date('Y-m-d H:i:s'),
        ]);
        $billingId = (int) $pdo->lastInsertId();

        $itemStatement = $pdo->prepare(
            'INSERT INTO billing_items (
                billing_id, item_category, item_description, quantity, unit_price, tax_amount, line_total
             ) VALUES (
                :billing_id, :item_category, :item_description, :quantity, :unit_price, :tax_amount, :line_total
             )'
        );

        foreach ($preparedItems as $preparedItem) {
            $itemStatement->execute([
                ':billing_id' => $billingId,
                ':item_category' => $preparedItem['category'],
                ':item_description' => $preparedItem['description'],
                ':quantity' => number_format($preparedItem['quantity'], 2, '.', ''),
                ':unit_price' => number_format($preparedItem['unit_price'], 2, '.', ''),
                ':tax_amount' => number_format($preparedItem['tax_amount'], 2, '.', ''),
                ':line_total' => number_format($preparedItem['line_total'], 2, '.', ''),
            ]);
        }

        $invoiceStatement = $pdo->prepare(
            'INSERT INTO invoices (
                billing_id, patient_id, admission_id, invoice_no, status, issued_at, due_at, subtotal,
                discount_amount, tax_amount, total_amount, balance_amount, notes
             ) VALUES (
                :billing_id, :patient_id, :admission_id, :invoice_no, :status, :issued_at, :due_at, :subtotal,
                :discount_amount, :tax_amount, :total_amount, :balance_amount, :notes
             )'
        );
        $invoiceStatement->execute([
            ':billing_id' => $billingId,
            ':patient_id' => $patient['id'],
            ':admission_id' => $admission['id'] ?? null,
            ':invoice_no' => generate_reference('INV'),
            ':status' => $billingStatus === 'paid' ? 'paid' : ($billingStatus === 'partially_paid' ? 'partially_paid' : 'issued'),
            ':issued_at' => date('Y-m-d H:i:s'),
            ':due_at' => normalize_datetime($payload['due_at'] ?? null, date('Y-m-d H:i:s', strtotime('+2 day'))),
            ':subtotal' => number_format($subtotal, 2, '.', ''),
            ':discount_amount' => number_format($discount, 2, '.', ''),
            ':tax_amount' => number_format($tax, 2, '.', ''),
            ':total_amount' => number_format($total, 2, '.', ''),
            ':balance_amount' => number_format($dueAmount, 2, '.', ''),
            ':notes' => normalize_string($payload['notes'] ?? null),
        ]);
        $invoiceId = (int) $pdo->lastInsertId();

        $paymentId = null;
        if ($paidAmount > 0) {
            $paymentStatement = $pdo->prepare(
                'INSERT INTO payments (
                    billing_id, invoice_id, patient_id, admission_id, payment_no, amount, payment_method,
                    payment_status, transaction_reference, paid_at, notes
                 ) VALUES (
                    :billing_id, :invoice_id, :patient_id, :admission_id, :payment_no, :amount, :payment_method,
                    :payment_status, :transaction_reference, :paid_at, :notes
                 )'
            );
            $paymentStatement->execute([
                ':billing_id' => $billingId,
                ':invoice_id' => $invoiceId,
                ':patient_id' => $patient['id'],
                ':admission_id' => $admission['id'] ?? null,
                ':payment_no' => generate_reference('PAY'),
                ':amount' => number_format($paidAmount, 2, '.', ''),
                ':payment_method' => normalize_string($payload['payment']['method'] ?? null, 20) ?? 'cash',
                ':payment_status' => 'completed',
                ':transaction_reference' => normalize_string($payload['payment']['transaction_reference'] ?? null, 100),
                ':paid_at' => normalize_datetime($payload['payment']['paid_at'] ?? null, date('Y-m-d H:i:s')),
                ':notes' => normalize_string($payload['payment']['notes'] ?? null),
            ]);
            $paymentId = (int) $pdo->lastInsertId();
        }

        write_audit_log($pdo, null, 'billing', $billingId, 'create_billing_record', [
            'patient_id' => $patient['id'],
            'admission_id' => $admission['id'] ?? null,
            'invoice_id' => $invoiceId,
            'payment_id' => $paymentId,
        ]);

        $pdo->commit();

        return [
            'patient_id' => (int) $patient['id'],
            'admission_id' => $admission['id'] ?? null,
            'billing_id' => $billingId,
            'invoice_id' => $invoiceId,
            'payment_id' => $paymentId,
            'total_amount' => number_format($total, 2, '.', ''),
            'due_amount' => number_format($dueAmount, 2, '.', ''),
        ];
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $exception;
    }
}
