document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.querySelector('.history-table tbody');
    if (!tableBody) return;

    if (typeof TokenService !== 'undefined' && !TokenService.isLoggedIn()) {
        window.location.href = 'login/login.html?redirect=' + encodeURIComponent('history.html');
        return;
    }

    tableBody.innerHTML = `
        <tr><td colspan="6" style="text-align:center;padding:40px;color:#888;">
            <i class="fas fa-circle-notch fa-spin"></i> Memuat riwayat reservasi...
        </td></tr>
    `;

    try {
        const reservations = await ReservationService.getMyReservations();
        renderHistory(reservations);
        bindFilters();
        bindActions();
    } catch (err) {
        tableBody.innerHTML = `
            <tr><td colspan="6" style="text-align:center;padding:40px;color:#f44336;">
                ${err.message || 'Gagal memuat riwayat.'}
            </td></tr>
        `;
    }

    function renderHistory(reservations) {
        if (!reservations.length) {
            tableBody.innerHTML = `
                <tr><td colspan="6" style="text-align:center;padding:40px;color:#888;">
                    Belum ada reservasi.
                </td></tr>
            `;
            return;
        }

        tableBody.innerHTML = '';
        reservations.forEach(res => {
            const status = (res.status || 'CONFIRMED').toUpperCase();
            const rowStatus = status === 'CHECKED_OUT' ? 'completed' : status === 'CANCELLED' ? 'cancelled' : 'confirmed';
            const row = document.createElement('tr');
            row.className = 'history-row';
            row.setAttribute('data-row-status', rowStatus);
            row.setAttribute('data-id', res.id);
            row.innerHTML = `
                <td><strong>${res.bookingCode}</strong><br><span class="muted">${res.roomNumber || '-'}</span></td>
                <td>${formatDate(res.checkIn)}</td>
                <td>${formatDate(res.checkOut)}</td>
                <td><span class="status-badge ${rowStatus}">${status}</span></td>
                <td>${formatCurrency(res.totalPrice)}</td>
                <td>
                    ${rowStatus === 'confirmed' ? `<button class="btn-cancel" data-id="${res.id}">Cancel</button>` : ''}
                    <button class="btn-invoice" ${rowStatus === 'cancelled' ? 'disabled' : ''}>Invoice</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    function bindFilters() {
        const tabs = document.querySelectorAll('.history-tab');
        const rows = () => document.querySelectorAll('.history-row');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const targetStatus = tab.getAttribute('data-status');
                rows().forEach(row => {
                    const rowStatus = row.getAttribute('data-row-status');
                    row.style.display = (targetStatus === 'all' || rowStatus === targetStatus) ? 'table-row' : 'none';
                });
            });
        });
    }

    function bindActions() {
        tableBody.addEventListener('click', async (e) => {
            const cancelBtn = e.target.closest('.btn-cancel');
            if (cancelBtn) {
                const id = cancelBtn.getAttribute('data-id');
                if (!confirm('Batalkan reservasi ini?')) return;
                try {
                    await ReservationService.cancel(id);
                    Toast.success('Reservasi dibatalkan.');
                    const reservations = await ReservationService.getMyReservations();
                    renderHistory(reservations);
                    bindFilters();
                } catch (err) {
                    Toast.error(err.message || 'Gagal membatalkan.');
                }
            }

            const invoiceBtn = e.target.closest('.btn-invoice:not([disabled])');
            if (invoiceBtn) {
                const row = invoiceBtn.closest('.history-row');
                const code = row.querySelector('td strong').textContent;
                Toast.info(`Invoice digital untuk ${code} siap diunduh (demo).`);
            }
        });
    }

    function formatDate(value) {
        if (!value) return '-';
        const d = new Date(value);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function formatCurrency(value) {
        if (value == null) return '-';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
    }
});
