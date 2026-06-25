document.addEventListener('DOMContentLoaded', () => {
    // 1. Membaca URL parameter hasil operan dari dashboard
    const urlParams = new URLSearchParams(window.location.search);
    const roomName = urlParams.get('room') || 'Deluxe King';
    const roomPrice = urlParams.get('price') || 'IDR 2.5M';

    // 2. Inject teks ke elemen penampung di form secara dinamis
    const targetRoomName = document.getElementById('targetRoomName');
    const targetRoomPrice = document.getElementById('targetRoomPrice');

    if (targetRoomName && targetRoomPrice) {
        targetRoomName.textContent = roomName;
        targetRoomPrice.textContent = roomPrice + ' / NIGHT';
    }

    // 3. Logika Submit Form ke Halaman Sukses
    const formGuestSubmit = document.getElementById('formGuestSubmit');
    
    if (formGuestSubmit) {
        formGuestSubmit.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Ambil data input tambahan buat nota sukses
            const guestName = formGuestSubmit.querySelector('input[type="text"]').value;
            const checkIn = formGuestSubmit.querySelectorAll('input[type="date"]')[0].value;
            const checkOut = formGuestSubmit.querySelectorAll('input[type="date"]')[1].value;
            
            // Generate Booking ID acak (Simulasi Backend)
            const bookingID = 'AMB-' + Math.floor(1000 + Math.random() * 9000);

            // Suntik elemen toast premium
            const toastHTML = `
            <div id="bookingToast" style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background-color: #141311; border: 1px solid #f3c356; color: #fff; padding: 15px 25px; border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 10000; display: flex; align-items: center; gap: 12px; font-family: 'Inter', sans-serif; transition: all 0.3s ease; opacity: 0; transform: translateX(-50%) translateY(-20px);">
                <i class="fas fa-check-circle" style="color: #4caf50; font-size: 18px;"></i> 
                <span style="font-weight: 500; font-size: 13px; letter-spacing: 0.5px;">Booking Berhasil! Menyiapkan E-Receipt...</span>
            </div>
            `;
            document.body.insertAdjacentHTML('beforeend', toastHTML);
            
            // Animasi toast masuk
            const bookingToast = document.getElementById('bookingToast');
            setTimeout(() => { 
                bookingToast.style.opacity = '1'; 
                bookingToast.style.transform = 'translateX(-50%) translateY(0)';
            }, 50);
            
            document.body.style.cursor = "wait";

            // Tahan 1.5 detik, lalu oper semua data ke success.html via URL Parameter
            setTimeout(() => {
                window.location.href = `success.html?id=${bookingID}&room=${encodeURIComponent(roomName)}&price=${encodeURIComponent(roomPrice)}&name=${encodeURIComponent(guestName)}&checkin=${checkIn}&checkout=${checkOut}`;
            }, 1500);
        });
    }
});