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

function validateKobi() {
    const result = validateFields(fields);
    const errors = [...result.errors];
    let firstError = result.isValid ? null : document.querySelector('.error');

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

    if (firstError && !result.isValid === false) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return { isValid: errors.length === 0, errors };
}

function collectFormData() {
    const data = {};

    document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach(input => {
        if (input.name) {
            let value = input.value.trim();
            if (input.name === 'revenue') {
                value = parseThousands(value);
            }
            data[input.name] = value;
        }
    });

    ['city', 'experience', 'trendyol'].forEach(name => {
        const selected = document.querySelector(`input[name="${name}"]:checked`);
        data[name] = selected ? selected.value : null;
    });

    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        if (cb.name) data[cb.name] = cb.checked;
    });

    return data;
}

document.addEventListener('DOMContentLoaded', function() {
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

    const revenueInput = document.querySelector('input[name="revenue"]');
    if (revenueInput) {
        revenueInput.addEventListener('input', function() {
            const cursorPos = this.selectionStart;
            const oldLength = this.value.length;
            this.value = formatThousands(this.value);
            const newLength = this.value.length;
            const posDiff = newLength - oldLength;
            this.setSelectionRange(cursorPos + posDiff, cursorPos + posDiff);
        });
    }

    setupFieldListeners(fields);

    const profileInput = document.querySelector('input[name="trendyolProfile"]');
    if (profileInput) {
        profileInput.addEventListener('input', () => clearFieldError(profileInput, 'text'));
    }

    const submitBtn = document.querySelector('button[type="submit"]');

    if (submitBtn) {
        let $msg = document.createElement("p");
        $msg.className = "form-message";
        submitBtn.after($msg);

        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();

            const result = validateKobi();

            if (result.isValid) {
                const formData = collectFormData();
                const honeypotValue = document.querySelector('input[name="_hp_field"]')?.value || '';

                apiBtn(
                    submitBtn,
                    'Business/Add',
                    {
                        CompanyTitle: formData.companyName,
                        ContactFullName: formData.name,
                        ContactEmail: formData.email,
                        ContactPhone: formData.phone,
                        Province: formData.city,
                        YearsInOperation: formData.experience,
                        AnnualRevenue: formData.revenue,
                        HasTrendyolStore: formData.trendyol === 'evet',
                        TrendyolStoreUrl: formData.trendyolProfile || '',
                        KvkkConsent: formData.kvkk,
                        EmploymentCommitment: formData.employment,
                        _hp_field: honeypotValue
                    },
                    'Başvurunuz başarıyla alındı.',
                    null,
                    './tesekkurler.html',
                    $msg
                );
            } else {
                $msg.textContent = "Lütfen formdaki hataları düzeltiniz.";
                $msg.className = "form-message error";
            }
        });
    }
});
