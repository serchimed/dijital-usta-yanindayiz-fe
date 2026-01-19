function clearErrors() {
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.error-message').forEach(el => el.remove());
}

function clearFieldError(element, type) {
    element.classList.remove('error');
    let errorMsg = null;

    if (type === 'radio') {
        const radioGroup = element.closest('.radio-group');
        errorMsg = radioGroup.nextElementSibling;
    } else if (type === 'checkbox') {
        const checkboxLabel = element.closest('.checkbox-label');
        errorMsg = checkboxLabel.nextElementSibling;
    } else {
        errorMsg = element.nextElementSibling;
    }

    if (errorMsg && errorMsg.classList.contains('error-message')) {
        errorMsg.remove();
    }
}

function showError(element, message, type) {
    element.classList.add('error');
    const errorSpan = document.createElement('span');
    errorSpan.className = 'error-message';
    errorSpan.textContent = message;

    if (type === 'radio') {
        const radioGroup = element.closest('.radio-group');
        radioGroup.insertAdjacentElement('afterend', errorSpan);
    } else if (type === 'checkbox') {
        const checkboxLabel = element.closest('.checkbox-label');
        checkboxLabel.insertAdjacentElement('afterend', errorSpan);
    } else {
        element.insertAdjacentElement('afterend', errorSpan);
    }
}

function validateFields(fields) {
    clearErrors();
    let firstError = null;
    const errors = [];

    for (const [name, field] of Object.entries(fields)) {
        let isValid = true;
        let element = null;

        if (field.type === 'text') {
            element = document.querySelector(`input[name="${name}"]`);
            const value = element ? element.value.trim() : '';

            if (value === '') {
                isValid = false;
            } else if (field.validate && !field.validate(value)) {
                isValid = false;
                field._useInvalidMessage = true;
            }
        } else if (field.type === 'radio') {
            element = document.querySelector(`input[name="${name}"]`);
            isValid = document.querySelector(`input[name="${name}"]:checked`) !== null;
        } else if (field.type === 'checkbox') {
            element = document.querySelector(`input[name="${name}"]`);
            isValid = element && element.checked;
        }

        if (!isValid && element) {
            const msg = field._useInvalidMessage ? field.invalidMessage : field.message;
            field._useInvalidMessage = false;
            showError(element, msg, field.type);
            errors.push(msg);
            if (!firstError) firstError = element;
        }
    }

    if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return { isValid: errors.length === 0, errors };
}

function setupFieldListeners(fields) {
    for (const [name, field] of Object.entries(fields)) {
        const elements = document.querySelectorAll(`input[name="${name}"]`);
        elements.forEach(el => {
            const eventType = field.type === 'text' ? 'input' : 'change';
            el.addEventListener(eventType, () => clearFieldError(el, field.type));
        });
    }
}
