document.addEventListener('DOMContentLoaded', async () => {
    const formHotelProfile = document.getElementById('formHotelProfile');
    const formSecurity = document.getElementById('formSecurity');
    const formPreferences = document.getElementById('formPreferences');

    async function loadHotelProfile() {
        try {
            const profile = await SettingsService.getHotelProfile();
            const setVal = (id, key) => {
                const el = document.getElementById(id);
                if (el && profile[key]) el.value = profile[key];
            };
            setVal('setHotelName', 'name');
            setVal('setHotelEmail', 'email');
            setVal('setHotelPhone', 'phone');
            setVal('setHotelAddress', 'location');
            setVal('setHotelWeb', 'website');

            const sidebarHotelName = document.querySelector('.sidebar-header p');
            if (sidebarHotelName && profile.name) {
                sidebarHotelName.textContent = profile.name.toUpperCase();
            }
        } catch (err) {
            if (typeof Toast !== 'undefined') Toast.error(err.message || 'Gagal memuat profil hotel.');
        }
    }

    async function loadPreferences() {
        try {
            const prefs = await SettingsService.getPreferences();
            const langEl = document.getElementById('prefLang');
            const notifEl = document.getElementById('prefNotif');
            if (langEl && prefs.language) langEl.value = prefs.language;
            if (notifEl && prefs.notifications != null) {
                notifEl.value = prefs.notifications ? 'enabled' : 'disabled';
            }
        } catch (err) {
            if (typeof Toast !== 'undefined') Toast.error(err.message || 'Gagal memuat preferensi.');
        }
    }

    if (formHotelProfile) {
        formHotelProfile.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                name: document.getElementById('setHotelName').value.trim(),
                email: document.getElementById('setHotelEmail').value.trim(),
                phone: document.getElementById('setHotelPhone').value.trim(),
                location: document.getElementById('setHotelAddress').value.trim(),
                website: document.getElementById('setHotelWeb').value.trim(),
            };

            try {
                await SettingsService.updateHotelProfile(payload);
                const sidebarHotelName = document.querySelector('.sidebar-header p');
                if (sidebarHotelName) sidebarHotelName.textContent = payload.name.toUpperCase();
                Toast.success('Profil hotel berhasil diperbarui!');
            } catch (err) {
                Toast.error(err.message || 'Gagal menyimpan profil hotel.');
            }
        });
    }

    if (formSecurity) {
        formSecurity.addEventListener('submit', async (e) => {
            e.preventDefault();

            const currentPassword = document.getElementById('currentPassword').value;
            const newPass = document.getElementById('newPassword').value;
            const confirmPass = document.getElementById('confirmPassword').value;

            if (newPass !== confirmPass) {
                Toast.error('Password baru dan konfirmasi tidak cocok.');
                return;
            }

            try {
                await AuthService.changePassword({ currentPassword, newPassword: newPass });
                formSecurity.reset();
                Toast.success('Password akun sukses diubah!');
            } catch (err) {
                Toast.error(err.message || 'Gagal mengubah password.');
            }
        });
    }

    if (formPreferences) {
        formPreferences.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                language: document.getElementById('prefLang').value,
                notifications: document.getElementById('prefNotif').value === 'enabled',
            };

            try {
                await SettingsService.updatePreferences(payload);
                Toast.success('Preferensi sistem berhasil disimpan!');
            } catch (err) {
                Toast.error(err.message || 'Gagal menyimpan preferensi.');
            }
        });
    }

    await loadHotelProfile();
    await loadPreferences();
});
