// Ortak validasyon helper fonksiyonları

function checkEmail(email) {
    return email.includes("@") && email.includes(".") && email.indexOf("@") < email.lastIndexOf(".") && email.indexOf(" ") < 0 && email.length >= 5;
}

function checkPhone(phone) {
    if (!phone || typeof phone !== "string") return false;
    if (phone.length !== 11) return false;
    if (phone[0] !== '0') return false;

    for (let i = 0; i < phone.length; i++) {
        let charCode = phone.charCodeAt(i);
        if (charCode < 48 || charCode > 57) return false;
    }

    return true;
}

function checkUrl(url) {
    if (!url || typeof url !== "string") return false;
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function checkNumber(value) {
    if (!value || typeof value !== "string") return false;
    for (let i = 0; i < value.length; i++) {
        let charCode = value.charCodeAt(i);
        if (charCode < 48 || charCode > 57) return false;
    }
    return true;
}

function checkMinAge(minAge) {
    return function(dateStr) {
        if (!dateStr) return false;
        const birthDate = new Date(dateStr);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= minAge;
    };
}
