/**
 * auth-guard.js — Hotel Ambarukmo Protected Route Guard
 * Sertakan script ini di SETIAP halaman yang memerlukan autentikasi.
 * Harus diload SEBELUM script halaman lainnya.
 *
 * Penggunaan (di head atau sebelum script utama):
 *   <script src="../../assets/js/api.js"></script>
 *   <script src="../../assets/js/auth-guard.js" data-role="admin"></script>
 *
 * Atribut data-role: "admin" | "staff" | "guest" | "any"
 */
(function() {
    const script = document.currentScript;
    const requiredRole = script ? (script.getAttribute('data-role') || 'any') : 'any';
    const requiredRoles = requiredRole.split(',').map(r => r.trim().toLowerCase());

    function getLoginUrl() {
    const path = window.location.pathname;

    if (path.includes('/admin/')) return '/admin/login.html';
    if (path.includes('/staff/')) return '/staff/login.html';
    if (path.includes('/guest/')) return '/guest/login/login.html';

    return '/index.html';
    }
    

    function guardCheck() {
        // Pastikan TokenService sudah tersedia (api.js harus di-load duluan)
        if (typeof TokenService === 'undefined') {
            console.error('[AuthGuard] api.js belum di-load sebelum auth-guard.js!');
            return;
        }

        const token = TokenService.getAccessToken();
        const user  = TokenService.getUserData();

        // Tidak ada token → redirect ke login
        if (!token) {
            window.location.replace(getLoginUrl());
            return;
        }

        // Cek role jika diperlukan
        if (requiredRole !== 'any' && user) {
            const userRole = (user.role || '').toLowerCase();

            if (!requiredRoles.includes(userRole)) {
                sessionStorage.setItem('auth_error', `Akses ditolak. Halaman ini hanya untuk ${requiredRole}.`);
                window.location.replace(getLoginUrl());
            }
        }

        // Isi info user di sidebar/navbar jika elemen ada
        _populateUserInfo(user);
    }

    function _populateUserInfo(user) {
        if (!user) return;

        // Admin sidebar user info
        const nameEl = document.querySelector('.user-info .name');
        const roleEl = document.querySelector('.user-info .role');
        if (nameEl) nameEl.textContent = user.name || user.username || 'User';
        if (roleEl) roleEl.textContent = (user.role || 'STAFF').toUpperCase();

        // Guest navbar login button
        const btnLoginNav = document.querySelector('.main-navbar .btn-login');
        if (btnLoginNav && (user.role || '').toLowerCase() === 'guest') {
            const displayName = user.name || user.username || 'Tamu';
            btnLoginNav.innerHTML = `<i class="fas fa-user-circle" style="color:#f3c356;margin-right:6px;"></i> ${displayName.toUpperCase()}`;
            btnLoginNav.href = '#';
        }
    }

    // Jalankan guard setelah DOM siap (DOMContentLoaded mungkin sudah lewat)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', guardCheck);
    } else {
        guardCheck();
    }

    // Tampilkan auth error message jika ada
    document.addEventListener('DOMContentLoaded', function() {
        const authError = sessionStorage.getItem('auth_error');
        if (authError && typeof Toast !== 'undefined') {
            Toast.error(authError);
            sessionStorage.removeItem('auth_error');
        }
    });
})();
