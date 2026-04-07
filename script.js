// script.js - Patient Bed Head Ticket Form Functionality

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('patientForm');
    const registrationNoInput = document.querySelector('input[name="registrationNo"]');
    const mobileInput = document.querySelector('input[name="mobile"]');
    const ageSexInput = document.querySelector('input[name="ageSex"]');

    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            // Show success message
            showAlert('Form submitted successfully!', 'success');
            
            // In a real application, you would send data to server here
            console.log('Form Data:', getFormData());
            
            // Optionally reset form after successful submission
            // form.reset();
        }
    });

    // Real-time validation for specific fields
    registrationNoInput.addEventListener('blur', validateRegistrationNo);
    mobileInput.addEventListener('blur', validateMobile);
    ageSexInput.addEventListener('blur', validateAgeSex);

    // Auto-format mobile number
    mobileInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) {
            value = value.substring(0, 10);
        }
        e.target.value = value;
    });

    // Auto-format age/sex field
    ageSexInput.addEventListener('input', function(e) {
        let value = e.target.value.toUpperCase();
        // Allow only numbers, /, M, F, O
        value = value.replace(/[^0-9\/MFO]/g, '');
        e.target.value = value;
    });

    // Auto-generate registration number (demo purpose)
    registrationNoInput.addEventListener('focus', function() {
        if (!this.value) {
            this.value = generateRegistrationNo();
        }
    });

    // Add current datetime to admission field if empty
    const admissionDateInput = document.querySelector('input[name="admissionDate"]');
    admissionDateInput.addEventListener('focus', function() {
        if (!this.value) {
            this.value = getCurrentDateTime();
        }
    });

    // Print form functionality
    addPrintButton();

    // Form validation functions
    function validateForm() {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[name]');
        
        // Clear previous error states
        clearErrors();

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                if (field.name !== 'employeeNo' && field.name !== 'relationship' && 
                    field.name !== 'dischargeDate' && field.name !== 'dutySisterSig' && 
                    field.name !== 'doctorSig' && field.name !== 'attendantSig') {
                    markFieldAsInvalid(field, 'This field is required');
                    isValid = false;
                }
            }
        });

        // Specific field validations
        if (!validateRegistrationNo()) isValid = false;
        if (!validateMobile()) isValid = false;
        if (!validateAgeSex()) isValid = false;

        return isValid;
    }

    function validateRegistrationNo() {
        const value = registrationNoInput.value.trim();
        if (!value) {
            markFieldAsInvalid(registrationNoInput, 'Registration number is required');
            return false;
        }
        if (value.length < 3) {
            markFieldAsInvalid(registrationNoInput, 'Registration number must be at least 3 characters');
            return false;
        }
        markFieldAsValid(registrationNoInput);
        return true;
    }

    function validateMobile() {
        const value = mobileInput.value.trim();
        if (!value) {
            markFieldAsInvalid(mobileInput, 'Mobile number is required');
            return false;
        }
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(value)) {
            markFieldAsInvalid(mobileInput, 'Please enter a valid 10-digit mobile number');
            return false;
        }
        markFieldAsValid(mobileInput);
        return true;
    }

    function validateAgeSex() {
        const value = ageSexInput.value.trim();
        if (!value) {
            markFieldAsInvalid(ageSexInput, 'Age/Sex is required');
            return false;
        }
        const ageSexRegex = /^\d{1,3}\/[MF]$/i;
        if (!ageSexRegex.test(value)) {
            markFieldAsInvalid(ageSexInput, 'Format: Age/Sex (e.g., 25/M or 30/F)');
            return false;
        }
        markFieldAsValid(ageSexInput);
        return true;
    }

    // Utility functions
    function markFieldAsInvalid(field, message) {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.invalid-feedback');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    function markFieldAsValid(field) {
        field.classList.add('is-valid');
        field.classList.remove('is-invalid');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.invalid-feedback');
        if (existingError) {
            existingError.remove();
        }
    }

    function clearErrors() {
        const errorFields = form.querySelectorAll('.is-invalid');
        errorFields.forEach(field => {
            field.classList.remove('is-invalid');
            const errorMessage = field.parentNode.querySelector('.invalid-feedback');
            if (errorMessage) {
                errorMessage.remove();
            }
        });
    }

    function showAlert(message, type) {
        // Remove existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        form.parentNode.insertBefore(alertDiv, form);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    function getFormData() {
        const formData = {};
        const fields = form.querySelectorAll('[name]');
        
        fields.forEach(field => {
            formData[field.name] = field.value;
        });
        
        return formData;
    }

    function generateRegistrationNo() {
        const timestamp = new Date().getTime().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `REG${timestamp}${random}`;
    }

    function getCurrentDateTime() {
        const now = new Date();
        // Format: YYYY-MM-DDTHH:MM
        return now.toISOString().slice(0, 16);
    }

    function addPrintButton() {
        const submitButton = form.querySelector('button[type="submit"]');
        const printButton = document.createElement('button');
        printButton.type = 'button';
        printButton.className = 'btn btn-outline-secondary px-5 ms-2';
        printButton.textContent = 'Print Form';
        printButton.addEventListener('click', function() {
            window.print();
        });
        
        submitButton.parentNode.appendChild(printButton);
    }

    // Data persistence (save form data to localStorage)
    function saveFormData() {
        const formData = getFormData();
        localStorage.setItem('patientFormData', JSON.stringify(formData));
    }

    function loadFormData() {
        const savedData = localStorage.getItem('patientFormData');
        if (savedData) {
            const formData = JSON.parse(savedData);
            Object.keys(formData).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = formData[key];
                }
            });
        }
    }

    // Auto-save form data when fields change
    const formFields = form.querySelectorAll('input, textarea, select');
    formFields.forEach(field => {
        field.addEventListener('input', saveFormData);
        field.addEventListener('change', saveFormData);
    });

    // Load saved data on page load
    loadFormData();

    // Clear form data from localStorage on successful submission
    form.addEventListener('submit', function() {
        localStorage.removeItem('patientFormData');
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl + S to save
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveFormData();
            showAlert('Form data saved locally!', 'info');
        }
        
        // Ctrl + P to print
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            window.print();
        }
    });

    // Initialize tooltips for better UX
    initializeTooltips();
});

function initializeTooltips() {
    // This would require Bootstrap's tooltip component
    // For now, we'll add title attributes to fields
    const fields = document.querySelectorAll('.form-control');
    fields.forEach(field => {
        const fieldName = field.getAttribute('name');
        switch(fieldName) {
            case 'registrationNo':
                field.title = 'Unique patient identification number';
                break;
            case 'ageSex':
                field.title = 'Format: Age in years followed by / and M/F (e.g., 25/M)';
                break;
            case 'mobile':
                field.title = '10-digit mobile number starting with 6-9';
                break;
            case 'employeeNo':
                field.title = 'Employee ID or PRMS number (if applicable)';
                break;
        }
    });
}

// Export functions for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateForm,
        validateRegistrationNo,
        validateMobile,
        validateAgeSex
    };
}
// script.js - Consent Form Functionality

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('consentForm');
    const patientNameInput = document.querySelector('input[name="patient_name"]');
    const mobileInput = document.querySelector('input[name="mobile"]');
    const witnessMobileInput = document.querySelector('input[name="witness_mobile"]');
    const patientNamePlaceholder = document.querySelector('.patient-name-placeholder');

    // Update patient name in consent text in real-time
    patientNameInput.addEventListener('input', function() {
        if (this.value.trim()) {
            patientNamePlaceholder.textContent = this.value;
        } else {
            patientNamePlaceholder.textContent = '________________';
        }
    });

    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;

            // Submit form via AJAX
            submitFormViaAJAX();
            
            // For demo purposes, we'll re-enable after 2 seconds
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        }
    });

    // Real-time validation for mobile numbers
    mobileInput.addEventListener('blur', validateMobile);
    witnessMobileInput.addEventListener('blur', validateWitnessMobile);

    // Auto-format mobile numbers
    mobileInput.addEventListener('input', formatMobileNumber);
    witnessMobileInput.addEventListener('input', formatMobileNumber);

    // Set current date and time
    setCurrentDateTime();

    // Auto-save form data
    initializeAutoSave();

    // Form validation functions
    function validateForm() {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        // Clear previous error states
        clearErrors();

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                markFieldAsInvalid(field, 'This field is required');
                isValid = false;
            }
        });

        // Specific field validations
        if (!validateMobile()) isValid = false;
        if (!validateWitnessMobile()) isValid = false;
        if (!validateAge()) isValid = false;

        return isValid;
    }

    function validateMobile() {
        const value = mobileInput.value.trim();
        if (!value) {
            markFieldAsInvalid(mobileInput, 'Mobile number is required');
            return false;
        }
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(value.replace(/\D/g, ''))) {
            markFieldAsInvalid(mobileInput, 'Please enter a valid 10-digit mobile number');
            return false;
        }
        markFieldAsValid(mobileInput);
        return true;
    }

    function validateWitnessMobile() {
        const value = witnessMobileInput.value.trim();
        if (!value) {
            markFieldAsInvalid(witnessMobileInput, 'Witness mobile number is required');
            return false;
        }
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(value.replace(/\D/g, ''))) {
            markFieldAsInvalid(witnessMobileInput, 'Please enter a valid 10-digit mobile number');
            return false;
        }
        markFieldAsValid(witnessMobileInput);
        return true;
    }

    function validateAge() {
        const ageInput = document.querySelector('input[name="patient_age"]');
        const value = parseInt(ageInput.value);
        if (isNaN(value) || value < 0 || value > 150) {
            markFieldAsInvalid(ageInput, 'Please enter a valid age (0-150)');
            return false;
        }
        markFieldAsValid(ageInput);
        return true;
    }

    // Utility functions
    function markFieldAsInvalid(field, message) {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
        
        const existingError = field.parentNode.querySelector('.invalid-feedback');
        if (existingError) {
            existingError.remove();
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    function markFieldAsValid(field) {
        field.classList.add('is-valid');
        field.classList.remove('is-invalid');
        
        const existingError = field.parentNode.querySelector('.invalid-feedback');
        if (existingError) {
            existingError.remove();
        }
    }

    function clearErrors() {
        const errorFields = form.querySelectorAll('.is-invalid');
        errorFields.forEach(field => {
            field.classList.remove('is-invalid');
            const errorMessage = field.parentNode.querySelector('.invalid-feedback');
            if (errorMessage) {
                errorMessage.remove();
            }
        });
    }

    function formatMobileNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) {
            value = value.substring(0, 10);
        }
        e.target.value = value;
    }

    function setCurrentDateTime() {
        const now = new Date();
        
        // Set current date
        const dateInput = document.querySelector('input[name="date"]');
        if (!dateInput.value) {
            dateInput.value = now.toISOString().split('T')[0];
        }
        
        // Set current time
        const timeInput = document.querySelector('input[name="time"]');
        if (!timeInput.value) {
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            timeInput.value = `${hours}:${minutes}`;
        }
        
        // Set witness date
        const witnessDateInput = document.querySelector('input[name="witness_date"]');
        if (!witnessDateInput.value) {
            witnessDateInput.value = now.toISOString().split('T')[0];
        }
    }

    function initializeAutoSave() {
        const formFields = form.querySelectorAll('input, textarea, select');
        formFields.forEach(field => {
            field.addEventListener('input', saveFormData);
            field.addEventListener('change', saveFormData);
        });

        // Load saved data on page load
        loadFormData();
    }

    function saveFormData() {
        const formData = getFormData();
        localStorage.setItem('consentFormData', JSON.stringify(formData));
    }

    function loadFormData() {
        const savedData = localStorage.getItem('consentFormData');
        if (savedData) {
            const formData = JSON.parse(savedData);
            Object.keys(formData).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = formData[key];
                    
                    // Update patient name placeholder if it's the patient name field
                    if (key === 'patient_name' && formData[key]) {
                        patientNamePlaceholder.textContent = formData[key];
                    }
                }
            });
        }
    }

    function getFormData() {
        const formData = {};
        const fields = form.querySelectorAll('[name]');
        
        fields.forEach(field => {
            formData[field.name] = field.value;
        });
        
        return formData;
    }

    function submitFormViaAJAX() {
        const formData = new FormData(form);
        
        fetch('submit_consent.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('Consent form submitted successfully!', 'success');
                // Clear saved form data
                localStorage.removeItem('consentFormData');
                // Optionally reset form
                // form.reset();
            } else {
                showAlert('Error submitting form: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Network error. Please try again.', 'danger');
        });
    }

    function showAlert(message, type) {
        // Remove existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        form.parentNode.insertBefore(alertDiv, form);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl + S to save
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveFormData();
            showAlert('Form data saved locally!', 'info');
        }
        
        // Ctrl + P to print
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            window.print();
        }
    });
});