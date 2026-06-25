document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('resTableBody');
    const modalEditRes = document.getElementById('modalEditRes');
    const formEditRes = document.getElementById('formEditRes');
    let currentResRow = null;

    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            const target = e.target;
            const row = target.closest('tr');
            if (!row) return;

            // --- A. LOGIKA TOMBOL EDIT ---
            if (target.closest('.btn-action-edit')) {
                currentResRow = row;
                
                if (!modalEditRes) return;

                // Masukin data teks ke form
                document.getElementById('editGuestName').value = row.cells[1].textContent;
                document.getElementById('editCheckin').value = row.cells[2].textContent;
                document.getElementById('editCheckout').value = row.cells[3].textContent;

                // Ekstrak status saat ini (Hapus titik peluru dan spasi)
                let currentStatus = row.cells[4].textContent.replace('•', '').trim();
                const statusDropdown = document.getElementById('editResStatus');
                if(statusDropdown) statusDropdown.value = currentStatus;

                modalEditRes.classList.remove('hidden');
                return; 
            }

            // --- B. LOGIKA TOMBOL CHECK-IN ---
            if (target.closest('.btn-checkin')) {
                const btn = target.closest('.btn-checkin');
                const guestName = row.cells[1].textContent;
                
                if(confirm(`Konfirmasi Check-in untuk tamu: ${guestName}?`)) {
                    btn.outerHTML = `<button class="btn-action btn-checkout" data-action="checkout">Check-out</button>`;
                    row.cells[4].innerHTML = '<span class="status occupied">• OCCUPIED</span>';
                }
                return;
            }

            // --- C. LOGIKA TOMBOL CHECK-OUT ---
            if (target.closest('.btn-checkout')) {
                const guestName = row.cells[1].textContent;
                
                if(confirm(`Konfirmasi Check-out untuk tamu: ${guestName}?`)) {
                    row.remove(); 
                }
                return;
            }
        });
    }

    // --- LOGIKA SAVE DATA EDITAN DARI MODAL ---
    if (formEditRes) {
        formEditRes.addEventListener('submit', (e) => {
            e.preventDefault(); 
            
            if(currentResRow) {
                // Update teks tabel
                currentResRow.cells[1].textContent = document.getElementById('editGuestName').value;
                currentResRow.cells[2].textContent = document.getElementById('editCheckin').value;
                currentResRow.cells[3].textContent = document.getElementById('editCheckout').value;
                
                // Update Badge Status
                const newStatus = document.getElementById('editResStatus').value;
                let statusClass = 'available'; // Default hijau untuk CONFIRMED
                if(newStatus === 'OCCUPIED') statusClass = 'occupied'; // Abu-abu
                if(newStatus === 'CANCELLED') statusClass = 'maintenance'; // Pakai warna merah bawaan maintenance

                currentResRow.cells[4].innerHTML = `<span class="status ${statusClass}">• ${newStatus}</span>`;
                
                modalEditRes.classList.add('hidden');
                
                // Panggil Toast Notif yang tadi udah kita bikin
                if (typeof showToast === "function") {
                    showToast("Data reservasi berhasil diupdate!");
                } else {
                    alert("Data reservasi berhasil diupdate!");
                }
            }
        });
    }

    // --- LOGIKA CLOSE MODAL ---
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            if(modalEditRes) modalEditRes.classList.add('hidden');
        });
    });
});