// Trendyol profile toggle for KOBİ form
document.addEventListener('DOMContentLoaded', function() {
    var trendyolRadios = document.querySelectorAll('input[name="trendyol"]');
    var profileLabel = document.getElementById('trendyol-profile-label');

    trendyolRadios.forEach(function(radio) {
        radio.addEventListener('change', function() {
            if (this.value === 'evet') {
                profileLabel.classList.remove('hidden');
            } else {
                profileLabel.classList.add('hidden');
            }
        });
    });
});
