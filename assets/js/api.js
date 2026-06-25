/**
 * api.js — Hotel Ambarukmo API Client
 * Centralized HTTP client dengan JWT management, retry logic, dan error handling.
 * Semua modul memanggil fungsi dari file ini untuk komunikasi backend.
 */

// ============================================================
// KONFIGURASI — Ganti BASE_URL sesuai alamat backend kamu
// ============================================================
const API_CONFIG = {
    BASE_URL: 'http://localhost:8080/api',
    TIMEOUT_MS: 10000,
    MAX_RETRIES: 2,
    RETRY_DELAY_MS: 1000,
};

// ============================================================
// TOKEN MANAGEMENT (sessionStorage — lebih aman dari localStorage)
// ============================================================
const TokenService = {
    getAccessToken:  () => sessionStorage.getItem('access_token'),
    getRefreshToken: () => sessionStorage.getItem('refresh_token'),
    getUserData:     () => JSON.parse(sessionStorage.getItem('user_data') || 'null'),

    setTokens(accessToken, refreshToken, userData) {
        sessionStorage.setItem('access_token', accessToken);
        if (refreshToken) sessionStorage.setItem('refresh_token', refreshToken);
        if (userData)     sessionStorage.setItem('user_data', JSON.stringify(userData));
    },

    clear() {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user_data');
    },

    isLoggedIn: () => !!sessionStorage.getItem('access_token'),

    getUserRole() {
        const user = this.getUserData();
        return user ? user.role : null;
    }
};

// ============================================================
// LOADING STATE MANAGER
// ============================================================
const LoadingState = {
    show(message = 'Memproses...') {
        let overlay = document.getElementById('apiLoadingOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'apiLoadingOverlay';
            overlay.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:15px;">
                    <div class="api-spinner"></div>
                    <span id="apiLoadingMsg" style="font-size:13px;color:#888;font-family:'Inter',sans-serif;letter-spacing:0.5px;">${message}</span>
                </div>
            `;
            overlay.style.cssText = `
                position:fixed;top:0;left:0;width:100%;height:100%;
                background:rgba(10,10,10,0.7);backdrop-filter:blur(4px);
                z-index:99998;display:flex;justify-content:center;align-items:center;
                opacity:0;transition:opacity 0.2s ease;pointer-events:all;
            `;
            document.body.appendChild(overlay);

            // Inject spinner CSS sekali
            if (!document.getElementById('apiSpinnerStyle')) {
                const style = document.createElement('style');
                style.id = 'apiSpinnerStyle';
                style.textContent = `
                    .api-spinner {
                        width:40px;height:40px;border:3px solid #2a2a2a;
                        border-top-color:#f3c356;border-radius:50%;
                        animation:apiSpin 0.8s linear infinite;
                    }
                    @keyframes apiSpin { to { transform:rotate(360deg); } }
                `;
                document.head.appendChild(style);
            }
        }
        document.getElementById('apiLoadingMsg').textContent = message;
        requestAnimationFrame(() => { overlay.style.opacity = '1'; });
    },

    hide() {
        const overlay = document.getElementById('apiLoadingOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 200);
        }
    }
};

// ============================================================
// TOAST NOTIFICATION (Universal — bekerja di admin & guest)
// ============================================================
const Toast = {
    show(message, type = 'success', durationMs = 3500) {
        // Hapus toast lama jika masih ada
        document.querySelectorAll('.api-toast').forEach(t => t.remove());

        const colors = {
            success: { border: '#f3c356', icon: 'fa-check-circle', iconColor: '#4caf50' },
            error:   { border: '#f44336', icon: 'fa-exclamation-circle', iconColor: '#f44336' },
            info:    { border: '#2196F3', icon: 'fa-info-circle', iconColor: '#2196F3' },
            warning: { border: '#ff9800', icon: 'fa-exclamation-triangle', iconColor: '#ff9800' },
        };
        const c = colors[type] || colors.success;

        const toast = document.createElement('div');
        toast.className = 'api-toast';
        toast.innerHTML = `<i class="fas ${c.icon}" style="color:${c.iconColor};font-size:18px;flex-shrink:0;"></i><span>${message}</span>`;
        toast.style.cssText = `
            position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-30px);
            background:#141311;border:1px solid ${c.border};color:#fff;
            padding:14px 22px;border-radius:4px;z-index:100000;
            display:flex;align-items:center;gap:12px;
            font-family:'Inter',sans-serif;font-size:13px;font-weight:500;
            box-shadow:0 10px 30px rgba(0,0,0,0.4);opacity:0;
            transition:all 0.3s ease;min-width:280px;max-width:460px;
            letter-spacing:0.3px;
        `;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => toast.remove(), 300);
        }, durationMs);
    },

    success: (msg) => Toast.show(msg, 'success'),
    error:   (msg) => Toast.show(msg, 'error'),
    info:    (msg) => Toast.show(msg, 'info'),
    warning: (msg) => Toast.show(msg, 'warning'),
};

// ============================================================
// TOKEN REFRESH LOGIC
// ============================================================
let _isRefreshing = false;
let _refreshSubscribers = [];

function _onRefreshed(newToken) {
    _refreshSubscribers.forEach(cb => cb(newToken));
    _refreshSubscribers = [];
}

async function _refreshAccessToken() {
    const refreshToken = TokenService.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
        TokenService.clear();
        _redirectToLogin();
        throw new Error('Refresh token expired');
    }

    const data = await response.json();
    const payload = (data && data.status === 'success') ? data.data : data;
    if (payload) {
        TokenService.setTokens(
            payload.token || payload.accessToken,
            payload.refreshToken,
            payload.user || TokenService.getUserData()
        );
    }
    return payload.token || payload.accessToken;
}

function _redirectToLogin() {
    const path = window.location.pathname;

    if (path.includes('/admin/')) {
        window.location.href = '/admin/login.html';
    } else if (path.includes('/guest/')) {
        window.location.href = '/guest/login/login.html';
    } else if (path.includes('/staff/')) {
        window.location.href = '/staff/login.html';
    } else {
        window.location.href = '/index.html';
    }
}

// ============================================================
// CORE FETCH FUNCTION dengan Retry & Auth
// ============================================================
async function apiFetch(endpoint, options = {}, retryCount = 0) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const token = TokenService.getAccessToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

    let response;
    try {
        response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
        });
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            throw new ApiError('Request timeout — server tidak merespons.', 0, 'TIMEOUT');
        }
        if (retryCount < API_CONFIG.MAX_RETRIES) {
            await _sleep(API_CONFIG.RETRY_DELAY_MS * (retryCount + 1));
            return apiFetch(endpoint, options, retryCount + 1);
        }
        throw new ApiError('Tidak dapat terhubung ke server. Periksa koneksi Anda.', 0, 'NETWORK_ERROR');
    }
    clearTimeout(timeoutId);

    // Token kadaluarsa — coba refresh
    if (response.status === 401) {
        if (!_isRefreshing) {
            _isRefreshing = true;
            try {
                const newToken = await _refreshAccessToken();
                _isRefreshing = false;
                _onRefreshed(newToken);
                // Ulangi request asli dengan token baru
                return apiFetch(endpoint, options, 0);
            } catch (e) {
                _isRefreshing = false;
                _redirectToLogin();
                throw e;
            }
        }

        // Jika sedang refresh, antri request ini
        return new Promise((resolve, reject) => {
            _refreshSubscribers.push(newToken => {
                resolve(apiFetch(endpoint, options, 0));
            });
        });
    }

    // Server error — retry
    if (response.status >= 500 && retryCount < API_CONFIG.MAX_RETRIES) {
        await _sleep(API_CONFIG.RETRY_DELAY_MS * (retryCount + 1));
        return apiFetch(endpoint, options, retryCount + 1);
    }

    // Parse response
    let data;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        const message = (typeof data === 'object' && data.message)
            ? data.message
            : `Server error: ${response.status}`;
        throw new ApiError(message, response.status, data.code || 'API_ERROR');
    }

    // Unwrap BaseResponse<T> dari backend Spring Boot
    if (typeof data === 'object' && data !== null && 'status' in data) {
        if (data.status === 'error') {
            throw new ApiError(data.message || 'Request failed', response.status, 'API_ERROR');
        }
        return data.data !== undefined ? data.data : data;
    }

    return data;
}

// Helper sleep
function _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Custom Error class
class ApiError extends Error {
    constructor(message, status, code) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
    }
}

// ============================================================
// API SERVICE MODULES
// ============================================================

/** Auth Service */
const AuthService = {
    async login(credentials) {
        return apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    },

    async register(userData) {
        return apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    async logout() {
        try {
            const refreshToken = TokenService.getRefreshToken();
            await apiFetch('/auth/logout', {
                method: 'POST',
                body: JSON.stringify({ refreshToken }),
            });
        } finally {
            TokenService.clear();
        }
    },

    async forgotPassword(email) {
        return apiFetch('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    async changePassword(payload) {
        return apiFetch('/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    },
};

/** Room Service */
const RoomService = {
    getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiFetch(`/rooms${query ? '?' + query : ''}`);
    },

    getAvailable(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiFetch(`/rooms/available${query ? '?' + query : ''}`);
    },

    getById(id) { return apiFetch(`/rooms/${id}`); },

    create(data) {
        return apiFetch('/rooms', { method: 'POST', body: JSON.stringify(data) });
    },

    update(id, data) {
        return apiFetch(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },

    updateStatus(id, status) {
        return apiFetch(`/rooms/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: status.toUpperCase() }),
        });
    },

    delete(id) {
        return apiFetch(`/rooms/${id}`, { method: 'DELETE' });
    },
};

/** Reservation Service */
const ReservationService = {
    getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiFetch(`/reservations${query ? '?' + query : ''}`);
    },

    getMyReservations() {
        return apiFetch('/reservations/my');
    },

    getById(id) { return apiFetch(`/reservations/${id}`); },

    create(data) {
        return apiFetch('/reservations', { method: 'POST', body: JSON.stringify(data) });
    },

    update(id, data) {
        return apiFetch(`/reservations/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },

    checkIn(id) {
        return apiFetch(`/reservations/${id}/checkin`, { method: 'PATCH' });
    },

    checkOut(id) {
        return apiFetch(`/reservations/${id}/checkout`, { method: 'PATCH' });
    },

    cancel(id) {
        return apiFetch(`/reservations/${id}`, { method: 'DELETE' });
    },
};

/** Staff Service */
const StaffService = {
    getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiFetch(`/staff${query ? '?' + query : ''}`);
    },

    create(data) {
        return apiFetch('/staff', { method: 'POST', body: JSON.stringify(data) });
    },

    update(id, data) {
        return apiFetch(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },

    delete(id) {
        return apiFetch(`/staff/${id}`, { method: 'DELETE' });
    },
};

/** Financial Service */
const FinancialService = {
    getSummary() { return apiFetch('/financials/summary'); },
    getChartData(year) { return apiFetch(`/financials/chart?year=${year}`); },
    getTransactions(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiFetch(`/financials/transactions${query ? '?' + query : ''}`);
    },
    exportReport(format = 'pdf') {
        return apiFetch(`/financials/export?format=${format}`, { method: 'POST' });
    },
};

/** Dashboard Service */
const DashboardService = {
    getStats() { return apiFetch('/dashboard/stats'); },
};

/** Settings Service */
const SettingsService = {
    getHotelProfile()       { return apiFetch('/settings/hotel'); },
    updateHotelProfile(d)   { return apiFetch('/settings/hotel', { method: 'PUT', body: JSON.stringify(d) }); },
    getPreferences()        { return apiFetch('/settings/preferences'); },
    updatePreferences(d)    { return apiFetch('/settings/preferences', { method: 'PUT', body: JSON.stringify(d) }); },
};

// ============================================================
// GLOBAL EXPORT — Tersedia di semua file JS
// ============================================================
window.API_CONFIG          = API_CONFIG;
window.TokenService        = TokenService;
window.LoadingState        = LoadingState;
window.Toast               = Toast;
window.ApiError            = ApiError;
window.apiFetch            = apiFetch;
window.AuthService         = AuthService;
window.RoomService         = RoomService;
window.ReservationService  = ReservationService;
window.StaffService        = StaffService;
window.FinancialService    = FinancialService;
window.DashboardService    = DashboardService;
window.SettingsService     = SettingsService;

// Backward compatibility: showToast masih dipanggil di banyak file lama
window.showToast = (message, type = 'success') => Toast.show(message, type);
