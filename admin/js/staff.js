/**
 * staff.js — Admin Staff Directory
 * CRUD staff via API. Filter dan search real-time.
 */
document.addEventListener('DOMContentLoaded', async () => {

    const staffGrid     = document.getElementById('staffGrid');
    const filterBtns    = document.querySelectorAll('.btn-filter');
    const searchStaff   = document.getElementById('searchStaff');
    const modalStaff    = document.getElementById('modalStaff');
    const formStaff     = document.getElementById('formStaff');
    const btnAddStaff   = document.getElementById('btnAddStaff');
    const modalStaffTitle = document.getElementById('modalStaffTitle');
    const modalConfirmDelete = document.getElementById('modalConfirmDelete');
    const btnCancelDelete    = document.getElementById('btnCancelDelete');
    const btnConfirmDelete   = document.getElementById('btnConfirmDelete');
    const confirmDeleteText  = document.getElementById('confirmDeleteText');

    let allStaff      = [];
    let currentFilter = 'all';
    let currentSearch = '';
    let editingStaffId   = null;
    let deletingStaffId  = null;

    // ==========================================
    // --- LOAD STAFF ---
    // ==========================================
    async function loadStaff() {
        if (!staffGrid) return;

        staffGrid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#555;">
                <i class="fas fa-circle-notch fa-spin" style="color:#f3c356;font-size:28px;display:block;margin-bottom:16px;"></i>
                Memuat data staff...
            </div>
        `;

        try {
            const response = await StaffService.getAll();
            allStaff = Array.isArray(response) ? response : (response.data || []);
            renderStaff();
        } catch (err) {
            staffGrid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#f44336;">
                    <i class="fas fa-exclamation-triangle" style="font-size:28px;display:block;margin-bottom:16px;"></i>
                    ${err.message || 'Gagal memuat data staff.'}
                    <br><button type="button" class="btn-retry-staff" style="margin-top:16px;background:#f3c356;color:#000;border:none;padding:10px 20px;border-radius:4px;cursor:pointer;font-size:12px;">
                        <i class="fas fa-redo"></i> Coba Lagi
                    </button>
                </div>
            `;
        }
    }

    // ==========================================
    // --- RENDER GRID ---
    // ==========================================
    function renderStaff() {
        if (!staffGrid) return;

        const filtered = allStaff.filter(staff => {
            const dept = staff.department || staff.dept || '';
            if (currentFilter !== 'all' && dept !== currentFilter) return false;
            if (currentSearch) {
                const name = (staff.name || '').toLowerCase();
                const role = ((staff.position || staff.role) || '').toLowerCase();
                if (!name.includes(currentSearch.toLowerCase()) && !role.includes(currentSearch.toLowerCase())) return false;
            }
            return true;
        });

        if (filtered.length === 0) {
            staffGrid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#555;">
                    <i class="fas fa-users" style="font-size:28px;display:block;margin-bottom:16px;"></i>
                    Tidak ada staff yang ditemukan.
                </div>
            `;
            return;
        }

        // Pasang event di grid (event delegation) — sekali saja
        staffGrid.innerHTML = '';
        filtered.forEach(staff => {
            const status  = staff.status || 'Active';
            const dept    = staff.department || staff.dept || 'Management';
            const dotClass = status === 'Active' ? 'active' : status === 'On Leave' ? 'leave' : 'inactive';

            const iconMap = {
                'Management':    'fa-user-tie',
                'Front Office':  'fa-concierge-bell',
                'Housekeeping':  'fa-broom',
                'Security':      'fa-shield-alt',
                'Food & Beverage': 'fa-utensils',
            };
            const icon = iconMap[dept] || 'fa-user-tie';

            const card = document.createElement('div');
            card.className = 'staff-card';
            card.setAttribute('data-department', dept);
            card.setAttribute('data-id', staff.id);
            card.innerHTML = `
                <div class="staff-status-dot ${dotClass}" title="${status}"></div>
                <div class="staff-avatar-large"><i class="fas ${icon}"></i></div>
                <div class="staff-info">
                    <h3>${staff.name}</h3>
                    <div class="staff-role">${staff.position || staff.role || 'Staff'}</div>
                    <div class="staff-dept-badge">${dept}</div>
                </div>
                <div class="staff-card-actions">
                    <button class="btn-staff-action edit" data-id="${staff.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-staff-action delete" data-id="${staff.id}" data-name="${staff.name}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            staffGrid.appendChild(card);
        });
    }

    if (staffGrid) {
        staffGrid.addEventListener('click', handleStaffGridClick);
    }

    function handleStaffGridClick(e) {
        const editBtn   = e.target.closest('.btn-staff-action.edit');
        const deleteBtn = e.target.closest('.btn-staff-action.delete');

        if (editBtn) {
            const id    = editBtn.getAttribute('data-id');
            const staff = allStaff.find(s => String(s.id) === String(id));
            if (staff) openEditModal(staff);
        }

        if (deleteBtn) {
            const id   = deleteBtn.getAttribute('data-id');
            const name = deleteBtn.getAttribute('data-name');
            deletingStaffId = id;
            if (confirmDeleteText) {
                confirmDeleteText.textContent = `Yakin ingin menghapus ${name} dari database?`;
            }
            if (modalConfirmDelete) modalConfirmDelete.classList.remove('hidden');
        }
    }

    // ==========================================
    // --- SEARCH & FILTER ---
    // ==========================================
    if (searchStaff) {
        searchStaff.addEventListener('input', (e) => {
            currentSearch = e.target.value;
            renderStaff();
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            const target = e.target.closest('.btn-filter');
            target.classList.add('active');
            currentFilter = target.getAttribute('data-dept') || 'all';
            renderStaff();
        });
    });

    // ==========================================
    // --- OPEN MODAL ADD ---
    // ==========================================
    if (btnAddStaff) {
        btnAddStaff.addEventListener('click', () => {
            editingStaffId = null;
            if (modalStaffTitle) modalStaffTitle.textContent = 'Add New Staff';
            if (formStaff) formStaff.reset();
            const idxEl = document.getElementById('staffIndex');
            if (idxEl) idxEl.value = '';
            if (modalStaff) modalStaff.classList.remove('hidden');
        });
    }

    function openEditModal(staff) {
        editingStaffId = staff.id;
        if (modalStaffTitle) modalStaffTitle.textContent = 'Edit Staff';

        const idxEl = document.getElementById('staffIndex');
        if (idxEl) idxEl.value = staff.id;

        const nameEl   = document.getElementById('staffName');
        const roleEl   = document.getElementById('staffRole');
        const deptEl   = document.getElementById('staffDept');
        const statusEl = document.getElementById('staffStatus');

        if (nameEl)   nameEl.value   = staff.name;
        if (roleEl)   roleEl.value   = staff.position || staff.role || '';
        if (deptEl)   deptEl.value   = staff.department || staff.dept;
        if (statusEl) statusEl.value = staff.status;

        if (modalStaff) modalStaff.classList.remove('hidden');
    }

    // ==========================================
    // --- SAVE (ADD / EDIT) ---
    // ==========================================
    if (formStaff) {
        formStaff.addEventListener('submit', async (e) => {
            e.preventDefault();

            const staffData = {
                name:       document.getElementById('staffName').value.trim(),
                position:   document.getElementById('staffRole').value.trim(),
                department: document.getElementById('staffDept').value,
                status:     document.getElementById('staffStatus').value,
            };

            const submitBtn = formStaff.querySelector('button[type="submit"]');
            const origText  = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            try {
                if (editingStaffId) {
                    await StaffService.update(editingStaffId, staffData);
                    Toast.success('Data staff berhasil diupdate!');
                } else {
                    await StaffService.create(staffData);
                    Toast.success('Staff baru berhasil ditambahkan!');
                }

                if (modalStaff) modalStaff.classList.add('hidden');
                loadStaff();

            } catch (err) {
                Toast.error(err.message || 'Gagal menyimpan data staff.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = origText;
            }
        });
    }

    // ==========================================
    // --- DELETE STAFF ---
    // ==========================================
    if (btnCancelDelete) {
        btnCancelDelete.addEventListener('click', () => {
            if (modalConfirmDelete) modalConfirmDelete.classList.add('hidden');
            deletingStaffId = null;
        });
    }

    if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener('click', async () => {
            if (!deletingStaffId) return;

            btnConfirmDelete.disabled = true;
            btnConfirmDelete.textContent = 'Menghapus...';

            try {
                await StaffService.delete(deletingStaffId);
                if (modalConfirmDelete) modalConfirmDelete.classList.add('hidden');
                Toast.success('Data staff berhasil dihapus!');
                deletingStaffId = null;
                loadStaff();
            } catch (err) {
                Toast.error(err.message || 'Gagal menghapus staff.');
            } finally {
                btnConfirmDelete.disabled = false;
                btnConfirmDelete.textContent = 'Hapus';
            }
        });
    }

    // Close modal staff
    const closeStaffBtn = document.querySelector('.close-modal-staff');
    if (closeStaffBtn) {
        closeStaffBtn.addEventListener('click', () => {
            if (modalStaff) modalStaff.classList.add('hidden');
        });
    }

    // ==========================================
    // --- INIT ---
    // ==========================================
    if (staffGrid) {
        staffGrid.addEventListener('click', (e) => {
            if (e.target.closest('.btn-retry-staff')) loadStaff();
        });
    }

    loadStaff();
});