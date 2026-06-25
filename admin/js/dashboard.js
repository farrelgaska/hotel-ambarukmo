document.addEventListener('DOMContentLoaded', () => {

    // Ambil elemen tbody dari tabel sebagai tempat utama kita nge-render data
    const tableBody = document.querySelector('.dark-table tbody'); 

    // --- 1. FITUR SEARCH ROOMS ---
    const searchInput = document.getElementById('searchRoom');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            const term = e.target.value.toLowerCase();
            const tableRows = tableBody.querySelectorAll('tr');
            
            tableRows.forEach(row => {
                const roomNo = row.cells[0].textContent.toLowerCase();
                const roomType = row.cells[1].textContent.toLowerCase();
                
                if (roomNo.includes(term) || roomType.includes(term)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // --- 2. FITUR MODAL ADD ROOM ---
    const btnAddRoom = document.getElementById('btnAddRoom');
    const modalAddRoom = document.getElementById('modalAddRoom');
    const formAddRoom = document.getElementById('formAddRoom');

    if (btnAddRoom) {
        btnAddRoom.addEventListener('click', () => {
            modalAddRoom.classList.remove('hidden');
        });
    }

    if (formAddRoom) {
        formAddRoom.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // 1. Ambil nilai dari input form add
            const inputs = formAddRoom.querySelectorAll('input, select');
            const newRoomNo = inputs[0].value;
            const newRoomType = inputs[1].value;
            
            // 2. Set default lantai & harga berdasarkan logika sederhana
            const floorNo = newRoomNo.charAt(0); // Ambil angka pertama sebagai lantai
            let defaultPrice = "2,500,000";
            if (newRoomType === "Executive Suite") defaultPrice = "5,800,000";
            if (newRoomType === "Presidential Suite") defaultPrice = "15,000,000";

            // 3. Buat elemen baris (TR) baru secara dinamis
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td class="gold-text bold">${newRoomNo}</td>
                <td>${newRoomType}</td>
                <td><span class="status available">• AVAILABLE</span></td>
                <td class="muted">Floor ${floorNo}</td>
                <td>${defaultPrice}</td>
                <td><button class="btn-detail" data-room="${newRoomNo}" data-type="${newRoomType}" data-status="AVAILABLE" data-price="${defaultPrice}"><i class="fas fa-pen" style="font-size: 10px; margin-right: 3px;"></i> Edit</button></td>
            `;

            // 4. Tambahkan baris baru ke dalam tabel paling bawah
            tableBody.appendChild(newRow);

            showToast("Kamar baru berhasil ditambahkan ke inventory!");
            modalAddRoom.classList.add('hidden');
            formAddRoom.reset(); // Kosongin form-nya lagi
        });
    }

    // --- 3. FITUR MODAL EDIT ROOM (Teknik Event Delegation) ---
    const modalRoomDetail = document.getElementById('modalRoomDetail');
    const formEditRoom = document.getElementById('formEditRoom');
    let currentRowBeingEdited = null; // Variabel penyimpan baris yang lagi diedit

    // Ubah teks tombol Edit yang udah ada dari HTML bawaan
    document.querySelectorAll('.btn-detail').forEach(btn => {
        btn.innerHTML = '<i class="fas fa-pen" style="font-size: 10px; margin-right: 3px;"></i> Edit';
    });

    // Pasang listener di TBODY. Biar kamar yang BARU DITAMBAHKAN tetap bisa diklik Edit!
    tableBody.addEventListener('click', function(e) {
        // Cari tombol terdekat yang punya class .btn-detail
        const btn = e.target.closest('.btn-detail');
        if (!btn) return; // Kalau yang diklik bukan tombol edit, cuekin aja

        // Simpan baris TR yang lagi diedit ke variabel global kita
        currentRowBeingEdited = btn.closest('tr');

        // Ambil data lama dari atribut tombol
        const roomNo = btn.getAttribute('data-room');
        const roomType = btn.getAttribute('data-type');
        const status = btn.getAttribute('data-status');
        const price = btn.getAttribute('data-price');

        // Masukkan data tersebut ke form edit
        document.getElementById('editRoomNo').value = roomNo;
        document.getElementById('editRoomType').value = roomType;
        document.getElementById('editRoomStatus').value = status;
        document.getElementById('editRoomPrice').value = price;

        modalRoomDetail.classList.remove('hidden');
    });

    if (formEditRoom) {
        formEditRoom.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Ambil data hasil editan
            const newType = document.getElementById('editRoomType').value;
            const newStatus = document.getElementById('editRoomStatus').value;
            const newPrice = document.getElementById('editRoomPrice').value;
            
            // Ambil referensi baris & tombol yang mau di-update
            const row = currentRowBeingEdited;
            const btn = row.querySelector('.btn-detail');

            // Update atribut tombol
            btn.setAttribute('data-type', newType);
            btn.setAttribute('data-status', newStatus);
            btn.setAttribute('data-price', newPrice);

            // Update teks di UI tabel
            row.cells[1].textContent = newType;
            row.cells[4].textContent = newPrice;

            // Update badge status UI
            let statusClass = 'available';
            if(newStatus === 'OCCUPIED') statusClass = 'occupied';
            if(newStatus === 'MAINTENANCE') statusClass = 'maintenance';
            row.cells[2].innerHTML = `<span class="status ${statusClass}">• ${newStatus}</span>`;

            // Efek background merah kalau lg maintenance
            if (newStatus === 'MAINTENANCE') {
                row.classList.add('row-maintenance');
            } else {
                row.classList.remove('row-maintenance');
            }

            showToast("Status & detail kamar berhasil diupdate!");
            modalRoomDetail.classList.add('hidden');
        });
    }

    // --- 4. GLOBAL CLOSE MODAL ---
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                modal.classList.add('hidden');
            });
        });
    });

    // Klik di luar box hitam buat nutup modal
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.add('hidden');
            }
        });
    });
});