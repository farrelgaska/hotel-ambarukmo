document.addEventListener('DOMContentLoaded', () => {
    const formHotelProfile = document.getElementById('formHotelProfile');
    const formSecurity = document.getElementById('formSecurity');
    const formPreferences = document.getElementById('formPreferences');

    // 1. Logika Save Profile Hotel
    if (formHotelProfile) {
        formHotelProfile.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simulasi ganti nama hotel di sidebar secara real-time
            const inputHotelName = document.getElementById('setHotelName').value;
            const sidebarHotelName = document.querySelector('.sidebar-header p');
            if (sidebarHotelName) {
                sidebarHotelName.textContent = inputHotelName.toUpperCase();
            }

            if (typeof showToast === "function") {
                showToast("Profil hotel berhasil diperbarui!");
            }
        });
    }

    // 2. Logika Update Password Akun
    if (formSecurity) {
        formSecurity.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newPass = document.getElementById('newPassword').value;
            const confirmPass = document.getElementById('confirmPassword').value;

            // Validasi kecocokan password baru
            if (newPass !== confirmPass) {
                alert("Waduh! Password baru dan konfirmasi password nggak cocok, bro.");
                return;
            }

            // Reset field form password setelah sukses
            formSecurity.reset();

            if (typeof showToast === "function") {
                showToast("Password akun sukses diubah!");
            }
        });
    }

    // 3. Logika Save System Preferences
    if (formPreferences) {
        formPreferences.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (typeof showToast === "function") {
                showToast("Preferensi sistem berhasil disimpan!");
            }
        });
    }
});