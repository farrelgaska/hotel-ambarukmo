document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.history-tab');
    const rows = document.querySelectorAll('.history-row');

    // --- LOGIKA FILTER STATUS TRANSAKSI ---
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

    // --- INTERAKSI TOMBOL INPUT/CANCEL (DUMMY ACTION) ---
    const cancelButtons = document.querySelectorAll('.btn-cancel');
    cancelButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('.history-row');
            const bookingCode = row.querySelector('td strong').textContent;

            if (confirm(`Apakah Anda yakin ingin membatalkan reservasi ${bookingCode}?`)) {
                alert(`Permintaan pembatalan ${bookingCode} telah dikirim. Menunggu validasi Admin.`);
            }
        });
    });

    const invoiceButtons = document.querySelectorAll('.btn-invoice:not([disabled])');
    invoiceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('.history-row');
            const bookingCode = row.querySelector('td strong').textContent;
            
            alert(`Membuka berkas Digital Invoice untuk pesanan ${bookingCode}...`);
        });
    });
});