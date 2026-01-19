const fields = {
    name:        { type: 'text',     message: 'Adınız Soyadınız zorunludur' },
    birthdate:   { type: 'text',     message: 'Doğum tarihi zorunludur', validate: checkMinAge(18), invalidMessage: 'Başvuru için en az 18 yaşında olmalısınız' },
    email:       { type: 'text',     message: 'E-posta adresi zorunludur', validate: checkEmail, invalidMessage: 'Geçerli bir e-posta adresi giriniz' },
    phone:       { type: 'text',     message: 'Telefon numarası zorunludur', validate: checkPhone, invalidMessage: 'Geçerli bir telefon numarası giriniz (0 ile başlayan 11 haneli, örn: 05556667788)' },
    education:   { type: 'radio',    message: 'Eğitim durumu seçiniz' },
    employed:    { type: 'radio',    message: 'Çalışma durumu seçiniz' },
    city:        { type: 'radio',    message: 'İkamet ili seçiniz' },
    kvkk:        { type: 'checkbox', message: 'KVKK onayı zorunludur' },
    declaration: { type: 'checkbox', message: 'Taahhüt onayı zorunludur' }
};

function collectFormData() {
    const data = {};

    document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="date"]').forEach(input => {
        if (input.name) data[input.name] = input.value.trim();
    });

    ['gender', 'disability', 'education', 'employed', 'city'].forEach(name => {
        const selected = document.querySelector(`input[name="${name}"]:checked`);
        data[name] = selected ? selected.value : null;
    });

    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        if (cb.name) data[cb.name] = cb.checked;
    });

    return data;
}

document.addEventListener('DOMContentLoaded', function() {
    setupFieldListeners(fields);

    const submitBtn = document.querySelector('button[type="submit"]');

    if (submitBtn) {
        let $msg = document.createElement("p");
        $msg.className = "form-message";
        submitBtn.after($msg);

        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();

            const result = validateFields(fields);

            if (result.isValid) {
                const formData = collectFormData();
                const honeypotValue = document.querySelector('input[name="_hp_field"]')?.value || '';

                apiBtn(
                    submitBtn,
                    'Individual/Add',
                    {
                        FullName: formData.name,
                        BirthDate: formData.birthdate,
                        Gender: formData.gender || '',
                        HasDisability: formData.disability === 'evet',
                        Email: formData.email,
                        Phone: formData.phone,
                        EducationLevel: formData.education,
                        IsEmployed: formData.employed === 'evet',
                        Province: formData.city,
                        KvkkConsent: formData.kvkk,
                        Declaration: formData.declaration,
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
