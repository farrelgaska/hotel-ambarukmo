document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    // 1. Fungsi Helper buat nampilin Toast Login yang elegan
    function showLoginToast(message) {
        const toastHTML = `
        <div id="loginToast" style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background-color: #1a1a1a; border: 1px solid #f3c356; color: #fff; padding: 15px 25px; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; gap: 10px; font-family: 'Inter', sans-serif; transition: opacity 0.3s ease; opacity: 0;">
            <i class="fas fa-check-circle" style="color: #4caf50; font-size: 20px;"></i> 
            <span style="font-weight: 500;">${message}</span>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', toastHTML);
        
        const loginToast = document.getElementById('loginToast');
        setTimeout(() => { loginToast.style.opacity = '1'; }, 50);
        document.body.style.cursor = "wait";
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = document.getElementById('username').value.toLowerCase();
        const pass = document.getElementById('password').value;

        if (user === 'admin' && pass === 'admin123') {
            showLoginToast('Login Berhasil sebagai Admin. Mengalihkan...');
            setTimeout(() => { window.location.href = 'admin/dashboard.html'; }, 1500);
        } 
        else if (user === 'staff' && pass === 'staff123') {
            showLoginToast('Login Berhasil sebagai Staff. Mengalihkan...');
            setTimeout(() => { window.location.href = 'staff/dashboard.html'; }, 1500);
        } 
        else {
            // Biar notif salahnya juga elegan, kita bikin versi merah
            const errorToast = `
            <div id="errorToast" style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background-color: #1a1a1a; border: 1px solid #f44336; color: #fff; padding: 15px 25px; border-radius: 8px; z-index: 10000; display: flex; align-items: center; gap: 10px; font-family: 'Inter', sans-serif;">
                <i class="fas fa-exclamation-triangle" style="color: #f44336; font-size: 20px;"></i> 
                <span>Username/Password Salah!</span>
            </div>
            `;
            document.body.insertAdjacentHTML('beforeend', errorToast);
            setTimeout(() => { document.getElementById('errorToast').remove(); }, 3000);
        }
    });
});