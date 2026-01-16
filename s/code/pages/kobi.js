// KOBİ formu - zorunlu alanlar ve hata mesajları
const fields = {
    companyName: { type: 'text',    message: 'İşletme unvanı zorunludur' },
    name:       { type: 'text',     message: 'Yetkili adı soyadı zorunludur' },
    email:      { type: 'text',     message: 'E-posta adresi zorunludur', validate: checkEmail, invalidMessage: 'Geçerli bir e-posta adresi giriniz' },
    phone:      { type: 'text',     message: 'Telefon numarası zorunludur', validate: checkPhone, invalidMessage: 'Geçerli bir telefon numarası giriniz (0 ile başlayan 11 haneli, örn: 05556667788)' },
    city:       { type: 'radio',    message: 'İşletme ili seçiniz' },
    experience: { type: 'radio',    message: 'Faaliyet süresi seçiniz' },
    revenue:    { type: 'text',     message: 'Yıllık ciro zorunludur', validate: checkNumber, invalidMessage: 'Yıllık ciro sadece rakam içermelidir' },
    trendyol:   { type: 'radio',    message: 'Trendyol mağaza durumu seçiniz' },
    kvkk:       { type: 'checkbox', message: 'KVKK onayı zorunludur' },
    employment: { type: 'checkbox', message: 'İstihdam taahhüdü zorunludur' }
};

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

function validate() {
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

    // Trendyol profil URL kontrolü (conditional)
    const trendyolSelected = document.querySelector('input[name="trendyol"]:checked');
    if (trendyolSelected && trendyolSelected.value === 'evet') {
        const profileInput = document.querySelector('input[name="trendyolProfile"]');
        const profileValue = profileInput ? profileInput.value.trim() : '';

        if (profileValue === '') {
            showError(profileInput, 'Trendyol satıcı profili zorunludur', 'text');
            errors.push('Trendyol satıcı profili zorunludur');
            if (!firstError) firstError = profileInput;
        } else if (!checkUrl(profileValue)) {
            showError(profileInput, 'Geçerli bir web sitesi URL\'si giriniz (https:// ile başlamalı)', 'text');
            errors.push('Geçerli bir web sitesi URL\'si giriniz');
            if (!firstError) firstError = profileInput;
        }
    }

    if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return { isValid: errors.length === 0, errors };
}

function collectFormData() {
    const data = {};

    // Text inputlar
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach(input => {
        if (input.name) {
            let value = input.value.trim();
            // Ciro alanındaki binlik ayracı kaldır
            if (input.name === 'revenue') {
                value = parseThousands(value);
            }
            data[input.name] = value;
        }
    });

    // Radio grupları
    ['city', 'experience', 'trendyol'].forEach(name => {
        const selected = document.querySelector(`input[name="${name}"]:checked`);
        data[name] = selected ? selected.value : null;
    });

    // Checkbox'lar
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        if (cb.name) data[cb.name] = cb.checked;
    });

    return data;
}

function submitForm() {
    const result = validate();

    if (!result.isValid) {
        return null;
    }

    return collectFormData();
}

// Form submit handler + Trendyol toggle
document.addEventListener('DOMContentLoaded', function() {
    // Trendyol profil alanı toggle
    const trendyolRadios = document.querySelectorAll('input[name="trendyol"]');
    const profileLabel = document.getElementById('trendyol-profile-label');

    trendyolRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'evet') {
                profileLabel.classList.remove('hidden');
            } else {
                profileLabel.classList.add('hidden');
            }
        });
    });

    // Yıllık ciro binlik ayraç formatlaması
    const revenueInput = document.querySelector('input[name="revenue"]');
    if (revenueInput) {
        revenueInput.addEventListener('input', function() {
            const cursorPos = this.selectionStart;
            const oldLength = this.value.length;
            this.value = formatThousands(this.value);
            const newLength = this.value.length;
            // İmleç pozisyonunu ayarla
            const posDiff = newLength - oldLength;
            this.setSelectionRange(cursorPos + posDiff, cursorPos + posDiff);
        });
    }

    // Hata temizleme event listener'ları
    for (const [name, field] of Object.entries(fields)) {
        const elements = document.querySelectorAll(`input[name="${name}"]`);
        elements.forEach(el => {
            const eventType = field.type === 'text' ? 'input' : 'change';
            el.addEventListener(eventType, () => clearFieldError(el, field.type));
        });
    }

    // Trendyol profil alanı hata temizleme
    const profileInput = document.querySelector('input[name="trendyolProfile"]');
    if (profileInput) {
        profileInput.addEventListener('input', () => clearFieldError(profileInput, 'text'));
    }

    // Form submit
    const submitBtn = document.querySelector('button[type="submit"]');

    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();

            const response = submitForm();

            if (response) {
                console.log('Form JSON:', JSON.stringify(response, null, 2));
                // TODO: API gönderimi
                alert('Başvurunuz alındı!');
            }
        });
    }
});
