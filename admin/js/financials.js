document.addEventListener('DOMContentLoaded', () => {
    // --- 1. RENDER CHART.JS ---
    const ctx = document.getElementById('financeChart').getContext('2d');
    
    // Setting warna tema gelap buat grafik
    Chart.defaults.color = '#888888';
    Chart.defaults.font.family = "'Inter', sans-serif";

    const financeChart = new Chart(ctx, {
        type: 'line', // Tipe grafik garis
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [
                {
                    label: 'Revenue',
                    data: [350, 420, 380, 500, 480, 450, 0], // Data dummy (dalam juta)
                    borderColor: '#f3c356', // Warna gold
                    backgroundColor: 'rgba(243, 195, 86, 0.1)',
                    borderWidth: 2,
                    tension: 0.4, // Bikin garisnya melengkung smooth
                    fill: true
                },
                {
                    label: 'Expenses',
                    data: [100, 150, 120, 180, 130, 120, 0],
                    borderColor: '#f44336', // Warna merah
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5], // Garis putus-putus
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { callback: function(value) { return 'Rp ' + value + 'M'; } }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });

    // --- 2. RENDER TRANSACTION TABLE ---
    const trxTableBody = document.getElementById('trxTableBody');
    const transactions = [
        { date: '25 Jun 2026', id: 'TRX-9081', desc: 'Room Payment - Budi Santoso', type: 'Income', amount: 'Rp 2.500.000', status: 'Completed' },
        { date: '25 Jun 2026', id: 'TRX-9082', desc: 'F&B Resto - Table 12', type: 'Income', amount: 'Rp 450.000', status: 'Completed' },
        { date: '24 Jun 2026', id: 'TRX-9083', desc: 'Vendor Payment - Laundry', type: 'Expense', amount: 'Rp 1.200.000', status: 'Completed' },
        { date: '24 Jun 2026', id: 'TRX-9084', desc: 'Room Payment - Siti Aminah', type: 'Income', amount: 'Rp 5.000.000', status: 'Pending' },
        { date: '23 Jun 2026', id: 'TRX-9085', desc: 'Electricity Bill', type: 'Expense', amount: 'Rp 8.500.000', status: 'Completed' }
    ];

    transactions.forEach(trx => {
        const row = document.createElement('tr');
        
        let typeBadge = trx.type === 'Income' ? 'type-income' : 'type-expense';
        let amountColor = trx.type === 'Income' ? 'text-green' : 'text-red';
        let statusBadge = trx.status === 'Completed' ? 'status available' : 'status maintenance';

        row.innerHTML = `
            <td>${trx.date}</td>
            <td class="gold-text bold">${trx.id}</td>
            <td>${trx.desc}</td>
            <td><span class="type-badge ${typeBadge}">${trx.type.toUpperCase()}</span></td>
            <td class="${amountColor} bold">${trx.type === 'Income' ? '+' : '-'}${trx.amount}</td>
            <td><span class="${statusBadge}">• ${trx.status.toUpperCase()}</span></td>
        `;
        trxTableBody.appendChild(row);
    });
});