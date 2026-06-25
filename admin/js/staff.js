document.addEventListener('DOMContentLoaded', () => {
    const staffGrid = document.getElementById('staffGrid');
    const filterBtns = document.querySelectorAll('.btn-filter'); // SINKRON: Pake .btn-filter bawaan HTML lu
    const searchStaff = document.getElementById('searchStaff');
    
    // Modal Elements
    const modalStaff = document.getElementById('modalStaff');
    const formStaff = document.getElementById('formStaff');
    const btnAddStaff = document.getElementById('btnAddStaff');
    const modalStaffTitle = document.getElementById('modalStaffTitle');

    // Data Dummy Staff (5 Departemen Lengkap)
    let staffData = [
        { name: 'Diana Putri', role: 'General Manager', dept: 'Management', status: 'Active' },
        { name: 'Ahmad Reza', role: 'Front Desk Manager', dept: 'Front Office', status: 'Active' },
        { name: 'Siti Sarah', role: 'Housekeeping Spv', dept: 'Housekeeping', status: 'On Leave' },
        { name: 'Budi Santoso', role: 'Night Auditor', dept: 'Front Office', status: 'Active' },
        { name: 'Rina Melati', role: 'Room Attendant', dept: 'Housekeeping', status: 'Active' },
        { name: 'Bambang Perkasa', role: 'Chief Security', dept: 'Security', status: 'Active' },
        { name: 'Siti Aminah', role: 'Head Chef', dept: 'Food & Beverage', status: 'Active' }
    ];

    let currentFilter = 'all';
    let currentSearch = '';

    // Render Grid
    function renderStaff() {
        if (!staffGrid) return;
        staffGrid.innerHTML = '';
        
        staffData.forEach((staff, index) => {
            // Filter Check
            if (currentFilter !== 'all' && staff.dept !== currentFilter) return;
            if (currentSearch && !staff.name.toLowerCase().includes(currentSearch.toLowerCase()) && !staff.role.toLowerCase().includes(currentSearch.toLowerCase())) return;

            // Status Dot class
            let dotClass = staff.status === 'Active' ? 'active' : staff.status === 'On Leave' ? 'leave' : 'inactive';
            
            // Icon dinamis berdasarkan 5 jenis department
            let icon = 'fa-user-tie'; 
            if (staff.dept === 'Housekeeping') icon = 'fa-broom';
            if (staff.dept === 'Front Office') icon = 'fa-concierge-bell';
            if (staff.dept === 'Security') icon = 'fa-shield-alt';
            if (staff.dept === 'Food & Beverage') icon = 'fa-utensils';

            const card = document.createElement('div');
            card.className = 'staff-card';
            card.setAttribute('data-department', staff.dept); 
            
            card.innerHTML = `
                <div class="staff-status-dot ${dotClass}" title="${staff.status}"></div>
                <div class="staff-avatar-large"><i class="fas ${icon}"></i></div>
                <div class="staff-info">
                    <h3>${staff.name}</h3>
                    <div class="staff-role">${staff.role}</div>
                    <div class="staff-dept-badge">${staff.dept}</div>
                </div>
                <div class="staff-card-actions">
                    <button class="btn-staff-action edit" onclick="editStaff(${index})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-staff-action delete" onclick="deleteStaff(${index})"><i class="fas fa-trash"></i> Delete</button>
                </div>
            `;
            staffGrid.appendChild(card);
        });
    }

    // Fungsi Real-time Search Input
    if (searchStaff) {
        searchStaff.addEventListener('input', (e) => {
            currentSearch = e.target.value;
            renderStaff();
        });
    }

    // Fungsi Filter Click Tabs
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // SINKRON: Mengamankan target click nyari .btn-filter terdekat
            const currentTarget = e.target.closest('.btn-filter');
            currentTarget.classList.add('active');
            
            currentFilter = currentTarget.getAttribute('data-dept');
            renderStaff();
        });
    });

    // BUKA MODAL ADD NEW STAFF
    if (btnAddStaff) {
        btnAddStaff.addEventListener('click', () => {
            modalStaffTitle.textContent = "Add New Staff";
            formStaff.reset();
            document.getElementById('staffIndex').value = ''; 
            modalStaff.classList.remove('hidden');
        });
    }

    // SIMPAN DATA (Handle Add Baru & Edit Existing)
    if (formStaff) {
        formStaff.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const index = document.getElementById('staffIndex').value;
            const newStaff = {
                name: document.getElementById('staffName').value,
                role: document.getElementById('staffRole').value,
                dept: document.getElementById('staffDept').value,
                status: document.getElementById('staffStatus').value
            };

            if (index === '') {
                staffData.push(newStaff);
                if (typeof showToast === "function") showToast("Staff baru berhasil ditambahkan!");
            } else {
                staffData[index] = newStaff;
                if (typeof showToast === "function") showToast("Data staff berhasil diupdate!");
            }

            modalStaff.classList.add('hidden');
            renderStaff();
        });
    }

    // FUNGSI EDIT DATA
    window.editStaff = function(index) {
        if (!modalStaffTitle || !modalStaff) return;
        
        modalStaffTitle.textContent = "Edit Staff";
        const staff = staffData[index];
        
        document.getElementById('staffIndex').value = index;
        document.getElementById('staffName').value = staff.name;
        document.getElementById('staffRole').value = staff.role;
        document.getElementById('staffDept').value = staff.dept;
        document.getElementById('staffStatus').value = staff.status;
        
        modalStaff.classList.remove('hidden');
    };

    // LOGIKA CUSTOM CONFIRMATION MODAL DELETE
    const modalConfirmDelete = document.getElementById('modalConfirmDelete');
    const btnCancelDelete = document.getElementById('btnCancelDelete');
    const btnConfirmDelete = document.getElementById('btnConfirmDelete');
    const confirmDeleteText = document.getElementById('confirmDeleteText');
    let staffIndexToDelete = null; 

    window.deleteStaff = function(index) {
        if (!modalConfirmDelete || !confirmDeleteText) return;
        staffIndexToDelete = index; 
        confirmDeleteText.textContent = `Yakin ingin menghapus ${staffData[index].name} dari database?`;
        modalConfirmDelete.classList.remove('hidden'); 
    };

    if (btnCancelDelete) {
        btnCancelDelete.addEventListener('click', () => {
            modalConfirmDelete.classList.add('hidden');
            staffIndexToDelete = null; 
        });
    }

    if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener('click', () => {
            if (staffIndexToDelete !== null) {
                staffData.splice(staffIndexToDelete, 1);
                renderStaff(); 
                
                modalConfirmDelete.classList.add('hidden');
                staffIndexToDelete = null; 
                
                if (typeof showToast === "function") showToast("Data staff berhasil dihapus!");
            }
        });
    }

    // Tombol Close Silang Modal Staff
    const closeStaffModalBtn = document.querySelector('.close-modal-staff');
    if (closeStaffModalBtn) {
        closeStaffModalBtn.addEventListener('click', () => {
            modalStaff.classList.add('hidden');
        });
    }

    renderStaff(); 
});