document.addEventListener('DOMContentLoaded', async () => {
    const ctxEl = document.getElementById('financeChart');
    const trxTableBody = document.getElementById('trxTableBody');
    if (!ctxEl || !trxTableBody) return;

    Chart.defaults.color = '#888888';
    Chart.defaults.font.family = "'Inter', sans-serif";

    const financeChart = new Chart(ctxEl.getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Revenue',
                data: [],
                borderColor: '#f3c356',
                backgroundColor: 'rgba(243, 195, 86, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: { mode: 'index', intersect: false },
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        callback(value) {
                            return 'Rp ' + (value / 1000000).toFixed(1) + 'M';
                        },
                    },
                },
                x: { grid: { display: false } },
            },
        },
    });

    function formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    async function loadSummary() {
        const summary = await FinancialService.getSummary();
        const totalRevenueEl = document.querySelector('[data-fin="totalRevenue"]');
        const totalTxEl = document.querySelector('[data-fin="totalTransactions"]');
        if (totalRevenueEl) totalRevenueEl.textContent = formatCurrency(summary.totalRevenue);
        if (totalTxEl) totalTxEl.textContent = summary.totalTransactions ?? 0;
    }

    async function loadChart() {
        const year = new Date().getFullYear();
        const chartData = await FinancialService.getChartData(year);
        financeChart.data.labels = chartData.map(item => item.month);
        financeChart.data.datasets[0].data = chartData.map(item => item.revenue || 0);
        financeChart.update();
    }

    async function loadTransactions() {
        trxTableBody.innerHTML = `
            <tr><td colspan="6" style="text-align:center;padding:30px;color:#555;">
                <i class="fas fa-circle-notch fa-spin"></i> Memuat transaksi...
            </td></tr>
        `;

        const transactions = await FinancialService.getTransactions();
        if (!Array.isArray(transactions) || transactions.length === 0) {
            trxTableBody.innerHTML = `
                <tr><td colspan="6" style="text-align:center;padding:30px;color:#555;">Belum ada transaksi.</td></tr>
            `;
            return;
        }

        trxTableBody.innerHTML = '';
        transactions.forEach(trx => {
            const row = document.createElement('tr');
            const amount = trx.amount || 0;
            const status = (trx.status || 'CONFIRMED').toUpperCase();
            const statusBadge = ['CHECKED_OUT', 'CONFIRMED', 'CHECKED_IN'].includes(status)
                ? 'status available'
                : 'status maintenance';

            row.innerHTML = `
                <td>${formatDate(trx.date)}</td>
                <td class="gold-text bold">${trx.bookingCode || trx.id}</td>
                <td>${trx.description || ('Room Payment - ' + (trx.guestName || 'Guest'))}</td>
                <td><span class="type-badge type-income">INCOME</span></td>
                <td class="text-green bold">+${formatCurrency(amount)}</td>
                <td><span class="${statusBadge}">• ${status}</span></td>
            `;
            trxTableBody.appendChild(row);
        });
    }

    try {
        await Promise.all([loadSummary(), loadChart(), loadTransactions()]);
    } catch (err) {
        if (typeof Toast !== 'undefined') Toast.error(err.message || 'Gagal memuat data financials.');
    }
});
