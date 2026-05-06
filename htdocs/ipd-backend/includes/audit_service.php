<?php
declare(strict_types=1);

function write_audit_log(
    PDO $pdo,
    ?int $userId,
    string $entityType,
    ?int $entityId,
    string $action,
    array $newValues = [],
    array $oldValues = []
): void {
    $statement = $pdo->prepare(
        'INSERT INTO audit_logs (
            user_id, entity_type, entity_id, action, request_method, endpoint, old_values, new_values, ip_address, user_agent
        ) VALUES (
            :user_id, :entity_type, :entity_id, :action, :request_method, :endpoint, :old_values, :new_values, :ip_address, :user_agent
        )'
    );

    $statement->execute([
        ':user_id' => $userId,
        ':entity_type' => $entityType,
        ':entity_id' => $entityId,
        ':action' => $action,
        ':request_method' => $_SERVER['REQUEST_METHOD'] ?? null,
        ':endpoint' => request_path(),
        ':old_values' => $oldValues === [] ? null : json_encode_safe($oldValues),
        ':new_values' => $newValues === [] ? null : json_encode_safe($newValues),
        ':ip_address' => client_ip_address(),
        ':user_agent' => request_user_agent(),
    ]);
}
