document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomName = urlParams.get('room') || 'Standard Room';
    const roomPrice = urlParams.get('price') || 'IDR 2.5M';
    const roomId = urlParams.get('roomId');

    const targetRoomName = document.getElementById('targetRoomName');
    const targetRoomPrice = document.getElementById('targetRoomPrice');

    if (targetRoomName && targetRoomPrice) {
        targetRoomName.textContent = roomName;
        targetRoomPrice.textContent = roomPrice + ' / NIGHT';
    }

    const formGuestSubmit = document.getElementById('formGuestSubmit');
    if (!formGuestSubmit) return;

    if (typeof TokenService !== 'undefined' && !TokenService.isLoggedIn()) {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `login/login.html?redirect=${redirect}`;
        return;
    }

    const user = TokenService.getUserData();
    const nameInput = formGuestSubmit.querySelector('input[type="text"]');
    if (user && nameInput) {
        nameInput.value = user.name || user.username || '';
    }

    formGuestSubmit.addEventListener('submit', async (e) => {
        e.preventDefault();

        const guestName = nameInput.value.trim();
        const checkIn = formGuestSubmit.querySelectorAll('input[type="date"]')[0].value;
        const checkOut = formGuestSubmit.querySelectorAll('input[type="date"]')[1].value;
        const submitBtn = formGuestSubmit.querySelector('button[type="submit"]');

        if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
            Toast.error('Tanggal check-out harus setelah check-in.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Memproses...';

        try {
            const payload = {
                guestName,
                checkIn,
                checkOut,
                roomType: roomName,
            };
            if (roomId) payload.roomId = parseInt(roomId, 10);

            const booking = await ReservationService.create(payload);

            Toast.success('Booking berhasil! Menyiapkan E-Receipt...');
            document.body.style.cursor = 'wait';

            setTimeout(() => {
                window.location.href = `success.html?id=${encodeURIComponent(booking.bookingCode)}&room=${encodeURIComponent(roomName)}&price=${encodeURIComponent(roomPrice)}&name=${encodeURIComponent(guestName)}&checkin=${checkIn}&checkout=${checkOut}`;
            }, 1200);
        } catch (err) {
            Toast.error(err.message || 'Booking gagal. Coba lagi.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'KONFIRMASI PEMESANAN';
        }
    });
});
