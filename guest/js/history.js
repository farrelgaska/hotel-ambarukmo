document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.history-tab');
    const rows = document.querySelectorAll('.history-row');

    // --- 1. CUSTOM TOAST NOTIFICATION PREMIUM (ANTI-ALERT) ---
    function launchPremiumToast(message) {
        // bikin container toast kalau belum ada di dom
        let toastContainer = document.getElementById('customToastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'customToastContainer';
            toastContainer.style.cssText = 'position: fixed; top: 30px; right: 30px; z-index: 100000; display: flex; flex-direction: column; gap: 12px;';
            document.body.appendChild(toastContainer);
        }

        // struktur pill toast mewah
        const toast = document.createElement('div');
        toast.style.cssText = 'background: #141311; border-left: 3px solid #f3c356; color: #fff; padding: 16px 22px; font-family: "Inter", sans-serif; font-size: 12.5px; font-weight: 500; box-shadow: 0 15px 40px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 12px; border-radius: 3px; transform: translateX(120%); opacity: 0; transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);';
        
        toast.innerHTML = `
            <i class="fas fa-check-circle" style="color: #27ae60; font-size: 16px;"></i>
            <span style="letter-spacing: 0.3px;">${message}</span>
        `;

        toastContainer.appendChild(toast);

        // animasi masuk (slide-in)
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }, 50);

        // animasi keluar (slide-out) setelah 3.5 detik
        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }

    // --- 2. LOGIKA FILTER STATUS TRANSAKSI ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const targetStatus = tab.getAttribute('data-status');

            rows.forEach(row => {
                const rowStatus = row.getAttribute('data-row-status');
                
                if (targetStatus === 'all' || rowStatus === targetStatus) {
                    row.style.display = 'table-row';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    });

    // --- 3. PREMIUM CANCELLATION MODAL INTERACTION ---
    const cancelButtons = document.querySelectorAll('.btn-cancel');
    
    cancelButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const row = btn.closest('.history-row');
            const bookingCode = row.querySelector('td strong').textContent;

            if (document.getElementById('customCancelModal')) return;

            // suntik struktur modal pembatalan mewah ke dalam dom
            const modalHTML = `
            <div id="customCancelModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(10, 9, 8, 0.7); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); z-index: 99999; display: flex; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s ease;">
                <div style="background: #141311; border: 1px solid #2a2a2a; border-top: 3px solid #e74c3c; padding: 35px 30px; width: 100%; max-width: 400px; border-radius: 4px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.3); transform: translateY(-20px); transition: transform 0.3s ease;" id="cancelModalCard">
                    <div style="margin-bottom: 20px;">
                        <i class="fas fa-calendar-times" style="color: #e74c3c; font-size: 38px;"></i>
                    </div>
                    <h3 style="font-family: 'Playfair Display', serif; color: #fff; font-size: 20px; margin-bottom: 10px; font-weight: 500; letter-spacing: 0.5px;">BATALKAN RESERVASI</h3>
                    <p style="color: #aaa; font-size: 13px; line-height: 1.6; margin-bottom: 30px; font-family: 'Inter', sans-serif;">Apakah Anda yakin ingin membatalkan reservasi <strong style="color: #f3c356;">${bookingCode}</strong>? Tindakan ini memerlukan validasi dari pihak Admin.</p>
                    <div style="display: flex; gap: 12px; justify-content: center;">
                        <button id="btnConfirmCancel" style="background: #e74c3c; color: #fff; border: none; padding: 12px 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; cursor: pointer; border-radius: 2px; flex: 1; font-family: 'Inter', sans-serif; transition: background 0.2s;">YA, BATALKAN</button>
                        <button id="btnDismissCancel" style="background: transparent; color: #fff; border: 1px solid #444; padding: 12px 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; cursor: pointer; border-radius: 2px; flex: 1; font-family: 'Inter', sans-serif; transition: all 0.2s;">KEMBALI</button>
                    </div>
                </div>
            </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            const modal = document.getElementById('customCancelModal');
            const card = document.getElementById('cancelModalCard');
            const btnConfirm = document.getElementById('btnConfirmCancel');
            const btnDismiss = document.getElementById('btnDismissCancel');
            
            // animasi masuk
            setTimeout(() => {
                modal.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
            
            // efek hover tombol dinamis
            btnConfirm.addEventListener('mouseover', () => btnConfirm.style.background = '#c0392b');
            btnConfirm.addEventListener('mouseout', () => btnConfirm.style.background = '#e74c3c');
            btnDismiss.addEventListener('mouseover', () => {
                btnDismiss.style.background = '#fff';
                btnDismiss.style.color = '#000';
                btnDismiss.style.borderColor = '#fff';
            });
            btnDismiss.addEventListener('mouseout', () => {
                btnDismiss.style.background = 'transparent';
                btnDismiss.style.color = '#fff';
                btnDismiss.style.borderColor = '#444';
            });

            // aksi ketika konfirmasi pembatalan diklik
            btnConfirm.addEventListener('click', () => {
                // 1. ubah data status baris di html secara real-time
                row.setAttribute('data-row-status', 'cancelled');
                
                // 2. ubah badge status tulisan jadi cancelled warna merah
                const badge = row.querySelector('.badge');
                if (badge) {
                    badge.className = 'badge badge-cancelled';
                    badge.textContent = 'CANCELLED';
                }
                
                // 3. matikan tombol cancel-nya biar gak bisa diklik lagi
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
                btn.disabled = true;

                closeModal();

                // 4. pemicu toast premium custom tanpa alert browser
                launchPremiumToast(`Permintaan pembatalan ${bookingCode} telah dikirim ke Admin.`);
            });
            
            // fungsi tutup modal
            const closeModal = () => {
                modal.style.opacity = '0';
                card.style.transform = 'translateY(-20px)';
                setTimeout(() => modal.remove(), 300);
            };
            
            btnDismiss.addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        });
    });

    // --- 4. LOGIKA TOMBOL INVOICE ---
    const invoiceButtons = document.querySelectorAll('.btn-invoice:not([disabled])');
    invoiceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('.history-row');
            const bookingCode = row.querySelector('td strong').textContent;
            
            launchPremiumToast(`Mengunduh berkas Digital Invoice ${bookingCode}...`);
        });
    });
});