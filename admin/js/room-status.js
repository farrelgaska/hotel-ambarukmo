document.addEventListener('DOMContentLoaded', () => {
    const roomGrid = document.getElementById('roomGrid');
    const filterBtns = document.querySelectorAll('.btn-filter');
    const searchRoom = document.getElementById('searchRoom'); // Tangkap elemen search
    const modalRoomStatus = document.getElementById('modalRoomStatus');
    const formRoomStatus = document.getElementById('formRoomStatus');
    
    // Data dummy kamar (udah di-upgrade pake info tamu & status dirty)
    let rooms = [
        { number: '101', type: 'Deluxe King', status: 'available' },
        { number: '102', type: 'Deluxe Twin', status: 'occupied', guestName: 'Budi Santoso', checkout: '26 Jun 2026' },
        { number: '103', type: 'Deluxe King', status: 'maintenance' },
        { number: '201', type: 'Executive Suite', status: 'dirty' },
        { number: '202', type: 'Executive Suite', status: 'occupied', guestName: 'Siti Aminah', checkout: '27 Jun 2026' },
        { number: '205', type: 'Deluxe Twin', status: 'available' },
        { number: '301', type: 'Presidential Suite', status: 'maintenance' },
        { number: '302', type: 'Deluxe King', status: 'dirty' }
    ];

    let currentClickedRoomIndex = null;
    let currentFilter = 'all';
    let currentSearch = ''; // Buat nyimpen teks yg diketik

    // Fungsi Render Grid Kamar
    function renderRooms() {
        roomGrid.innerHTML = ''; 
        
        rooms.forEach((room, index) => {
            // 1. Cek Filter Tombol
            if (currentFilter !== 'all' && room.status !== currentFilter) return;
            
            // 2. Cek Filter Pencarian Nomor Kamar
            if (currentSearch && !room.number.includes(currentSearch)) return;

            // Tentukan icon berdasarkan status
            let iconClass = room.status === 'available' ? 'fa-check-circle' : 
                            room.status === 'occupied' ? 'fa-user' : 
                            room.status === 'dirty' ? 'fa-broom' : 'fa-tools';
            let badgeClass = room.status; 
            let badgeText = room.status.toUpperCase();

            // HTML khusus info tamu (cuma dirender kalau kamar 'occupied')
            let guestHtml = '';
            if (room.status === 'occupied' && room.guestName) {
                guestHtml = `
                    <div class="room-guest-info">
                        <div><i class="fas fa-id-badge"></i> <span>${room.guestName}</span></div>
                        <div><i class="fas fa-sign-out-alt"></i> Out: ${room.checkout}</div>
                    </div>
                `;
            }

            // Buat elemen kartu
            const card = document.createElement('div');
            card.className = `room-card ${room.status}`;
            card.innerHTML = `
                <div class="room-header">
                    <h3>${room.number}</h3>
                    <i class="fas ${iconClass} room-icon"></i>
                </div>
                <div class="room-type-text">${room.type}</div>
                <span class="status ${badgeClass}">• ${badgeText}</span>
                ${guestHtml} 
            `;

            // Event Klik Kartu buat buka Modal
            card.addEventListener('click', () => {
                currentClickedRoomIndex = index;
                document.getElementById('displayRoomNumber').textContent = room.number;
                document.getElementById('displayRoomType').value = room.type;
                document.getElementById('updateRoomStatus').value = room.status;
                modalRoomStatus.classList.remove('hidden');
            });

            roomGrid.appendChild(card);
        });
    }

    // Event Listener buat Fitur Search
    if (searchRoom) {
        searchRoom.addEventListener('input', (e) => {
            currentSearch = e.target.value;
            renderRooms();
        });
    }

    // Event Listener Filter Tombol
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderRooms();
        });
    });

    // Simpan Perubahan Status
    if (formRoomStatus) {
        formRoomStatus.addEventListener('submit', (e) => {
            e.preventDefault();
            const newStatus = document.getElementById('updateRoomStatus').value;
            
            // Ubah datanya
            rooms[currentClickedRoomIndex].status = newStatus;
            
            // Render ulang layarnya
            renderRooms();
            modalRoomStatus.classList.add('hidden');
            
            if (typeof showToast === "function") {
                showToast(`Status Kamar ${rooms[currentClickedRoomIndex].number} berhasil diupdate!`);
            }
        });
    }

    // Tutup modal pakai tombol X
    const closeBtn = document.querySelector('.close-modal-room');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modalRoomStatus.classList.add('hidden');
        });
    }

    // Jalanin render pertama kali
    renderRooms();
});