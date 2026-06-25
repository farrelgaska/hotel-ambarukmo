document.addEventListener('DOMContentLoaded', () => {
    const formAdminLogin = document.getElementById('formAdminLogin');
    
    if (formAdminLogin) {
        formAdminLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            document.body.style.cursor = "wait";
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        });
    }
});