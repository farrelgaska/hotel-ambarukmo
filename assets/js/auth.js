/**
 * auth.js — Admin & Staff Login Handler
 * Menggantikan login hardcoded dengan autentikasi via API backend.
 */
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    // Tampilkan pesan error dari auth-guard jika ada
    const authError = sessionStorage.getItem('auth_error');
    if (authError && typeof Toast !== 'undefined') {
        Toast.error(authError);
        sessionStorage.removeItem('auth_error');
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const submitBtn     = loginForm.querySelector('button[type="submit"]');

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            Toast.warning('Username dan password harus diisi.');
            return;
        }

        // Disable form selama request berlangsung
        submitBtn.disabled = true;
        submitBtn.textContent = 'Authenticating...';
        document.body.style.cursor = 'wait';

        try {
            const response = await AuthService.login({ username, password });

            // Backend diharapkan mengembalikan: { token, refreshToken, user: { id, name, role } }
            const { token, refreshToken, user } = response;
            TokenService.setTokens(token, refreshToken, user);

            const role = (user.role || '').toLowerCase();

            if (typeof Toast !== 'undefined') {
                Toast.success(`Login berhasil! Selamat datang, ${user.name || username}.`);
            }

            // Redirect berdasarkan role
            setTimeout(() => {
                const path = window.location.pathname;
                if (role === 'admin' || role === 'manager') {
                    window.location.href = path.includes('/admin/') ? 'dashboard.html' : 'admin/dashboard.html';
                } else if (role === 'staff') {
                    window.location.href = path.includes('/admin/') ? 'room-status.html' : 'admin/room-status.html';
                } else {
                    window.location.href = path.includes('/guest/') ? '../dashboard.html' : 'guest/dashboard.html';
                }
            }, 1200);

        } catch (err) {
            document.body.style.cursor = 'default';
            submitBtn.disabled = false;
            submitBtn.textContent = 'LOGIN';

            if (typeof Toast !== 'undefined') {
                Toast.error(err.message || 'Username atau password salah.');
            } else {
                // Fallback toast manual jika api.js belum load
                const errorDiv = document.createElement('div');
                errorDiv.style.cssText = `
                    position:fixed;top:20px;left:50%;transform:translateX(-50%);
                    background:#141311;border:1px solid #f44336;color:#fff;
                    padding:14px 22px;border-radius:4px;z-index:10000;
                    font-family:'Inter',sans-serif;font-size:13px;
                `;
                errorDiv.innerHTML = `<i class="fas fa-exclamation-circle" style="color:#f44336;margin-right:8px;"></i>${err.message || 'Login gagal. Coba lagi.'}`;
                document.body.appendChild(errorDiv);
                setTimeout(() => errorDiv.remove(), 3500);
            }

            // Shake animation pada form
            loginForm.style.animation = 'none';
            requestAnimationFrame(() => {
                loginForm.style.animation = 'loginShake 0.4s ease';
            });
        }
    });

    // Inject shake keyframe
    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `
        @keyframes loginShake {
            0%,100%{transform:translateX(0)}
            20%,60%{transform:translateX(-8px)}
            40%,80%{transform:translateX(8px)}
        }
    `;
    document.head.appendChild(shakeStyle);
});