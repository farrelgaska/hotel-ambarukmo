/**
 * auth-guest.js — Guest Login, Register, Forgot Password via Backend API
 */
document.addEventListener('DOMContentLoaded', () => {

    function notify(message, type = 'success') {
        if (typeof Toast !== 'undefined') {
            Toast.show(message, type);
            return;
        }
        alert(message);
    }

    const formLogin = document.getElementById('formGuestLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUser').value.trim();
            const password = document.getElementById('loginPass').value;
            const submitBtn = formLogin.querySelector('button[type="submit"]');

            submitBtn.disabled = true;
            submitBtn.textContent = 'Memproses...';

            try {
                const response = await AuthService.login({ username, password });
                TokenService.setTokens(response.token, response.refreshToken, response.user);

                const role = (response.user.role || '').toLowerCase();
                if (role !== 'guest') {
                    TokenService.clear();
                    notify('Akun ini bukan akun tamu. Gunakan portal Admin/Staff.', 'error');
                    return;
                }

                notify(`Login berhasil! Selamat datang, ${response.user.name}.`);
                setTimeout(() => {
                    const params = new URLSearchParams(window.location.search);
                    const redirect = params.get('redirect');
                    window.location.href = redirect || '../dashboard.html';
                }, 1000);
            } catch (err) {
                notify(err.message || 'Login gagal.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'MASUK KE PORTAL';
            }
        });
    }

    const formRegister = document.getElementById('formGuestRegister');
    if (formRegister) {
        formRegister.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const phone = document.getElementById('regPhone').value.trim();
            const password = document.getElementById('regPass').value;
            const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
            const submitBtn = formRegister.querySelector('button[type="submit"]');

            submitBtn.disabled = true;
            submitBtn.textContent = 'Mendaftar...';

            try {
                const response = await AuthService.register({ name, username, email, phone, password });
                TokenService.setTokens(response.token, response.refreshToken, response.user);
                notify(`Registrasi sukses! Akun ${name} berhasil dibuat.`);
                setTimeout(() => { window.location.href = '../dashboard.html'; }, 1200);
            } catch (err) {
                notify(err.message || 'Registrasi gagal.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'REGISTRASI SEKARANG';
            }
        });
    }

    const formForgot = document.getElementById('formGuestForgot');
    if (formForgot) {
        formForgot.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgotEmail').value.trim();
            const submitBtn = formForgot.querySelector('button[type="submit"]');

            submitBtn.disabled = true;
            try {
                await AuthService.forgotPassword(email);
                notify(`Link pemulihan telah dikirim ke ${email}.`);
                setTimeout(() => { window.location.href = 'login.html'; }, 1500);
            } catch (err) {
                notify(err.message || 'Email tidak ditemukan.', 'error');
            } finally {
                submitBtn.disabled = false;
            }
        });
    }
});
