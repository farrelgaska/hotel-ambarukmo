document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.querySelector('.transition-overlay');
    // Ambil semua tombol BOOK NOW yang tidak berstatus disabled/unavailable
    const bookButtons = document.querySelectorAll('.btn-card-action:not(.btn-unavailable)');

    bookButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();

            // Tangkap data spesifik dari kartu kamar yang diklik lu
            const roomCard = button.closest('.room-premium-card');
            const roomName = roomCard.querySelector('h3').textContent;
            const roomPrice = roomCard.querySelector('.card-price').textContent.split('/')[0].trim();

            // 1. Jalankan animasi tirai putih menutup layar
            if (overlay) {
                overlay.classList.add('active');
            }

            // 2. Tahan perpindahan halaman selama 400ms sampai animasi kelar
            setTimeout(() => {
                // Oper nama & harga kamar lewat URL Parameter biar halaman tujuannya dinamis
                window.location.href = `booking.html?room=${encodeURIComponent(roomName)}&price=${encodeURIComponent(roomPrice)}`;
            }, 400);
        });
    });
});