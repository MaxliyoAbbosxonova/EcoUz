
    // API Configuration
    const API_BASE_URL = 'http://localhost:8000/api/v1/';
    let currentAppealId = null;
    let currentAppealData = null;
    let allUsers = [];

    // Status mapping
    const statusConfig = {
      'NEW': { label: 'Yangi', icon: '🆕', class: 'status-new' },
      'ASSIGNED': { label: 'Tayinlangan', icon: '👤', class: 'status-assigned' },
      'ACCEPTED': { label: 'Qabul qilingan', icon: '✅', class: 'status-accepted' },
      'DONE': { label: 'Bajarilgan', icon: '🎉', class: 'status-done' },
      'REJECTED': { label: 'Rad etilgan', icon: '❌', class: 'status-rejected' }
    };

    // Check authentication
    function checkAuth() {
      const token = localStorage.getItem('access_token');
      const userStr = localStorage.getItem('user');

      let user = {};
      try {
        user = JSON.parse(userStr || '{}');
      } catch (error) {
        console.log('No user data found');
      }

      document.getElementById('userName').textContent = user.login || 'Test Operator';
      return true;
    }

    // API call with JWT token
    async function apiCall(endpoint, options = {}) {
      const token = localStorage.getItem('access_token');

      const config = {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      };

      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (response.status === 401) {
          showToast('Sessiya tugadi. Iltimos qaytadan kiring', 'error');
          setTimeout(() => {
            localStorage.clear();
            window.location.href = 'login.html';
          }, 2000);
          throw new Error('Unauthorized');
        }

        return response;
      } catch (error) {
        console.error('API call error:', error);
        throw error;
      }
    }

    // Load appeals
    async function loadAppeals() {
      try {
        showLoading('Murojatlar yuklanmoqda...');

        const response = await apiCall('operator/applications/?status=new');

        if (!response.ok) {
          throw new Error('Murojatlarni yuklashda xatolik');
        }

        const data = await response.json();
        const appeals = data.results || data;
        displayAppeals(appeals);
        hideLoading();
      } catch (error) {
        hideLoading();
        showToast('Murojatlarni yuklashda xatolik yuz berdi', 'error');
        console.error('Load appeals error:', error);
      }
    }

    // Display appeals
    function displayAppeals(appeals) {
      const container = document.getElementById('appealsContainer');
      const emptyState = document.getElementById('emptyState');
      const totalAppeals = document.getElementById('totalAppeals');

      totalAppeals.textContent = appeals.length;

      if (appeals.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
      }

      emptyState.style.display = 'none';

      container.innerHTML = appeals.map(appeal => {
        const status = statusConfig[appeal.status] || statusConfig['NEW'];
        const imageUrl = appeal.image ? `${appeal.image}` : null;

        return `
          <div class="appeal-card" onclick="openDetailModal(${appeal.id})">
            <div class="appeal-image-container">
              ${imageUrl
                ? `<img src="${imageUrl}" alt="Murojat rasmi" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                   <div class="appeal-image-placeholder" style="display: none;">📷</div>`
                : `<div class="appeal-image-placeholder">📷</div>`
              }
              <div class="appeal-status-badge ${status.class}">
                <span>${status.icon}</span>
                <span>${status.label}</span>
              </div>
            </div>
            <div class="appeal-body">
              <div class="appeal-info-row">
                <div class="info-icon">🆔</div>
                <div class="info-content">
                  <div class="info-label">Murojat raqami</div>
                  <div class="info-value">${appeal.id}</div>
                </div>
              </div>

              <div class="appeal-info-row">
                <div class="info-icon">👤</div>
                <div class="info-content">
                  <div class="info-label">To'liq ism</div>
                  <div class="info-value">${appeal.fullname || 'Belgilanmagan'}</div>
                </div>
              </div>

              <div class="appeal-info-row">
                <div class="info-icon">📞</div>
                <div class="info-content">
                  <div class="info-label">Telefon</div>
                  <div class="info-value">${appeal.phone || 'Belgilanmagan'}</div>
                </div>
              </div>

              <div class="appeal-info-row">
                <div class="info-icon">📍</div>
                <div class="info-content">
                  <div class="info-label">Viloyat</div>
                  <div class="info-value">${getRegionName(appeal.region)}</div>
                </div>
              </div>

              <div class="appeal-info-row">
                <div class="info-icon">🏙️</div>
                <div class="info-content">
                  <div class="info-label">Tuman</div>
                  <div class="info-value">${getDistrictName(appeal.district)}</div>
                </div>
              </div>

              <div class="appeal-info-row">
                <div class="info-icon">📅</div>
                <div class="info-content">
                  <div class="info-label">Yaratilgan sana</div>
                  <div class="info-value">${formatDate(appeal.created_at)}</div>
                </div>
              </div>

              <div class="appeal-footer">
                <div class="view-details-text">
                  <span>Batafsil ko'rish</span>
                  <span class="arrow-icon">→</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Get region name (you may need to fetch this from API)
    function getRegionName(regionId) {
      if (!regionId) return 'Belgilanmagan';
      return `Viloyat ${regionId}`;
    }

    // Get district name (you may need to fetch this from API)
    function getDistrictName(districtId) {
      if (!districtId) return 'Belgilanmagan';
      return `Tuman ${districtId}`;
    }

    // Open detail modal
    async function openDetailModal(appealId) {
      try {
        showLoading('Ma\'lumotlar yuklanmoqda...');

        const response = await apiCall(`operator/applications/${appealId}/`);

        if (!response.ok) {
          throw new Error('Murojat ma\'lumotlarini yuklashda xatolik');
        }

        const appeal = await response.json();
        currentAppealData = appeal;
        currentAppealId = appealId;

        // Set image
        const modalImage = document.getElementById('modalImage');
        if (appeal.image) {
          const imageUrl = `${appeal.image}`;
          modalImage.innerHTML = `<img src="${imageUrl}" alt="Murojat rasmi" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.innerHTML='📷'">`;
        } else {
          modalImage.textContent = '📷';
        }

        // Set detail section with new design
        const status = statusConfig[appeal.status] || statusConfig['NEW'];
        document.getElementById('modalDetailSection').innerHTML = `
          <div class="detail-row">
            <div class="detail-icon">🆔</div>
            <div class="detail-content">
              <div class="detail-label">Murojat raqami</div>
              <div class="detail-value">${appeal.id}</div>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-icon">📊</div>
            <div class="detail-content">
              <div class="detail-label">Status</div>
              <div class="detail-value">${status.icon} ${status.label}</div>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-icon">👤</div>
            <div class="detail-content">
              <div class="detail-label">To'liq ism</div>
              <div class="detail-value">${appeal.fullname || 'Belgilanmagan'}</div>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-icon">📞</div>
            <div class="detail-content">
              <div class="detail-label">Telefon</div>
              <div class="detail-value">${appeal.phone || 'Belgilanmagan'}</div>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-icon">📍</div>
            <div class="detail-content">
              <div class="detail-label">Viloyat</div>
              <div class="detail-value">${getRegionName(appeal.region)}</div>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-icon">🏙️</div>
            <div class="detail-content">
              <div class="detail-label">Tuman</div>
              <div class="detail-value">${getDistrictName(appeal.district)}</div>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-icon">🌍</div>
            <div class="detail-content">
              <div class="detail-label">Koordinatalar</div>
              <div class="detail-value">${appeal.latitude || 'N/A'}, ${appeal.longitude || 'N/A'}</div>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-icon">📅</div>
            <div class="detail-content">
              <div class="detail-label">Yaratilgan sana</div>
              <div class="detail-value">${formatDate(appeal.created_at)}</div>
            </div>
          </div>
        `;

        // Set description
        const descSection = document.getElementById('modalDescriptionSection');
        const descText = document.getElementById('modalDescription');
        if (appeal.description) {
          descText.textContent = appeal.description;
          descSection.style.display = 'block';
        } else {
          descSection.style.display = 'none';
        }

        hideLoading();
        document.getElementById('detailModal').classList.add('active');
      } catch (error) {
        hideLoading();
        showToast('Ma\'lumotlarni yuklashda xatolik', 'error');
        console.error('Load detail error:', error);
      }
    }

    // Close detail modal
    function closeDetailModal() {
      document.getElementById('detailModal').classList.remove('active');
      currentAppealData = null;
    }

    // Open assign modal from detail modal
    function openAssignModalFromDetail() {
      if (!currentAppealId) return;

      document.getElementById('modalAppealId').textContent = `#${currentAppealId}`;
      document.getElementById('assignedUser').value = '';
      document.getElementById('assignModal').classList.add('active');
    }

    // Load users
    async function loadUsers() {
      try {
        const response = await apiCall('users/users/');

        if (!response.ok) {
          throw new Error('Hodimlarni yuklashda xatolik');
        }

        const data = await response.json();
        allUsers = (data.results || data).filter(user => user.role === 'EXECUTOR');
        populateUserSelect();
      } catch (error) {
        showToast('Hodimlarni yuklashda xatolik yuz berdi', 'error');
        console.error('Load users error:', error);
      }
    }

    // Populate user select
    function populateUserSelect() {
      const select = document.getElementById('assignedUser');
      select.innerHTML = '<option value="">Hodim tanlang...</option>' +
        allUsers.map(user => `
          <option value="${user.id}">${user.login}${user.phone ? ' (' + user.phone + ')' : ''}</option>
        `).join('');
    }

    // Close assign modal
    function closeAssignModal() {
      document.getElementById('assignModal').classList.remove('active');
    }

    // Assign appeal
    async function assignAppeal() {
      const userId = document.getElementById('assignedUser').value;

      if (!userId) {
        showToast('Iltimos hodim tanlang!', 'error');
        return;
      }

      if (!currentAppealId) {
        showToast('Murojat topilmadi', 'error');
        return;
      }

      try {
        showLoading('Tayinlanmoqda...');
        const response = await apiCall(`operator/applications/${currentAppealId}/`, {
  method: 'PATCH',
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    assigned_to: parseInt(userId),
    status: "ASSIGNED"
  })
});

if (!response.ok) {
  const data = await response.json();
  console.error("Backend error:", data);
  throw new Error("Tayinlashda xatolik");
}

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Tayinlashda xatolik');
        }

        hideLoading();
        closeAssignModal();
        closeDetailModal();
        showToast('Murojat muvaffaqiyatli tayinlandi! ✅', 'success');

        setTimeout(() => {
          loadAppeals();
        }, 1000);

      } catch (error) {
        hideLoading();
        showToast(error.message || 'Tayinlashda xatolik yuz berdi', 'error');
        console.error('Assign error:', error);
      }
    }

    // Format date
    function formatDate(dateString) {
      if (!dateString) return 'Belgilanmagan';
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    }

    // Show loading
    function showLoading(text) {
      document.getElementById('loadingText').textContent = text;
      document.getElementById('loadingOverlay').classList.add('active');
    }

    // Hide loading
    function hideLoading() {
      document.getElementById('loadingOverlay').classList.remove('active');
    }

    // Show toast
    function showToast(message, type = 'success') {
      const toast = document.getElementById('toast');
      const toastIcon = document.getElementById('toastIcon');
      const toastText = document.getElementById('toastText');

      toast.className = `toast ${type}`;
      toastIcon.textContent = type === 'success' ? '✅' : '❌';
      toastText.textContent = message;

      toast.classList.add('active');

      setTimeout(() => {
        toast.classList.remove('active');
      }, 4000);
    }

    // Event Listeners
    document.getElementById('refreshBtn').addEventListener('click', loadAppeals);

    document.getElementById('logoutBtn').addEventListener('click', function() {
      localStorage.clear();
      window.location.href = 'login.html';
    });

    document.getElementById('closeDetailBtn').addEventListener('click', closeDetailModal);
    document.getElementById('openAssignBtn').addEventListener('click', openAssignModalFromDetail);

    document.getElementById('closeAssignBtn').addEventListener('click', closeAssignModal);
    document.getElementById('cancelBtn').addEventListener('click', closeAssignModal);
    document.getElementById('submitAssignBtn').addEventListener('click', assignAppeal);

    document.getElementById('detailModal').addEventListener('click', function(e) {
      if (e.target === this) {
        closeDetailModal();
      }
    });

    document.getElementById('assignModal').addEventListener('click', function(e) {
      if (e.target === this) {
        closeAssignModal();
      }
    });

    // Initialize
    if (checkAuth()) {
      loadAppeals();
      loadUsers();
    }
