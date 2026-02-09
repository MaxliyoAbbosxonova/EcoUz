
        // Sample images
        const sampleImages = [
            'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
            'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
            'https://images.unsplash.com/photo-1511497584788-876760111969?w=800',
            'https://images.unsplash.com/photo-1518623001395-125242310d0c?w=800',
            'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800'
        ];

        let allAppeals = [];
        let currentFilter = 'all';

        // Determine status
        function getStatus(status) {
  const s = status?.toLowerCase();

  if (['new', 'assigned', 'accepted'].includes(s)) {
    return 'processing';
  }

  if (['done', 'rejected'].includes(s)) {
    return 'completed';
  }

  return 'unknown';
}

        // Translate status
        function translateStatus(status) {
        const generalStatus = getStatus(status);
        return generalStatus === 'completed' ? 'Tugatildi' : 'Jarayonda';
        }

        // Get status icon
        function getStatusIcon(status) {
        const generalStatus = getStatus(status);
         return generalStatus === 'completed' ? '✅' : '⏳';
}

        // Format date
        function formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'long', year: 'numeric' });
        }

        // Update statistics
        function updateStatistics(data) {
            const processing = data.filter(a => getStatus(a.status) === 'processing').length;
            const completed = data.filter(a => getStatus(a.status) === 'completed').length;

            document.getElementById('totalStat').textContent = data.length;
            document.getElementById('processingStat').textContent = processing;
            document.getElementById('completedStat').textContent = completed;

            document.getElementById('countAll').textContent = data.length;
            document.getElementById('countProcessing').textContent = processing;
            document.getElementById('countCompleted').textContent = completed;

            document.getElementById('statsOverview').style.display = 'grid';
            document.getElementById('filterTabs').style.display = 'flex';
            document.getElementById('searchSection').style.display = 'block';
        }

        // Create appeal card
        function createAppealCard(appeal, index) {
            const status = getStatus(appeal.status);
            const statusText = translateStatus(status);
            const statusIcon = getStatusIcon(status);
const imageUrl = appeal.image
    ? appeal.image
    : sampleImages[index % sampleImages.length];

            return `
                <div class="appeal-card" style="animation: fadeIn 0.5s ease ${index * 0.1}s both;">
                    <div class="card-header">
                        <div class="card-status status-${status}">
                            ${statusIcon} ${statusText}
                        </div>
                        <div class="card-date">
                            📅 ${formatDate(appeal.created_at) || 'Sana ko\'rsatilmagan'}
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="card-location">
                            <div class="location-item">
                                <div class="location-icon">📍</div>
                                <div class="location-text">
                                    <div class="location-label">Hudud</div>
                                    <div class="location-value">${appeal.region_name || 'Ko\'rsatilmagan'}</div>
                                </div>
                            </div>
                            ${appeal.district_name ? `
                                <div class="location-item">
                                    <div class="location-icon">🏘️</div>
                                    <div class="location-text">
                                        <div class="location-label">Tuman</div>
                                        <div class="location-value">${appeal.district_name}</div>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        ${appeal.description ? `
                            <div class="card-description">
                                <div class="description-label">📝 Murojat mazmuni</div>
                                ${appeal.description}
                            </div>
                        ` : ''}
                    </div>

                    <img src="${imageUrl}" alt="Murojat rasmi" class="card-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="image-placeholder" style="display:none;">
                        <div class="placeholder-icon">🏞️</div>
                        <div class="placeholder-text">Rasm yuklanmadi</div>
                    </div>
                </div>
            `;
        }

        // Render appeals
        function renderAppeals(filter = 'all', searchTerm = '') {
            const container = document.getElementById('appealsContainer');

            let filtered = filter === 'all' ? allAppeals :
                          allAppeals.filter(a => getStatus(a.status) === filter);

            // Apply search
            if (searchTerm) {
                filtered = filtered.filter(a => {
                    const searchLower = searchTerm.toLowerCase();
                    return (a.fullname && a.fullname.toLowerCase().includes(searchLower)) ||
                           (a.region_name && a.region_name.toLowerCase().includes(searchLower)) ||
                           (a.district_name && a.district_name.toLowerCase().includes(searchLower));
                });
            }

            if (filtered.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🔍</div>
                        <h3 class="empty-title">Murojatlar topilmadi</h3>
                        <p class="empty-text">Bu kategoriyada murojatlar mavjud emas</p>
                    </div>
                `;
                return;
            }

            // Group by status
            const processing = filtered.filter(a => getStatus(a.status) === 'processing');
            const completed = filtered.filter(a => getStatus(a.status) === 'completed');

            let html = '';

            if (filter === 'all' || filter === 'processing') {
                if (processing.length > 0) {
                    html += `
                        <div class="appeals-section">
                            <div class="section-header">
                                <h2 class="section-title">
                                    ⏳ Jarayonda
                                    <span class="section-count">${processing.length}</span>
                                </h2>
                            </div>
                            <div class="appeals-grid">
                                ${processing.map((a, i) => createAppealCard(a, i)).join('')}
                            </div>
                        </div>
                    `;
                }
            }

            if (filter === 'all' || filter === 'completed') {
                if (completed.length > 0) {
                    html += `
                        <div class="appeals-section">
                            <div class="section-header">
                                <h2 class="section-title">
                                    ✅ Tugatildi
                                    <span class="section-count">${completed.length}</span>
                                </h2>
                            </div>
                            <div class="appeals-grid">
                                ${completed.map((a, i) => createAppealCard(a, i)).join('')}
                            </div>
                        </div>
                    `;
                }
            }

            container.innerHTML = html;
        }

        // Load appeals
        function loadAppeals() {
            const loading = document.getElementById('loading');
            const container = document.getElementById('appealsContainer');

            fetch('http://127.0.0.1:8000/api/v1/applications/')
                .then(res => {
                    if (!res.ok) throw new Error(`Server xatosi: ${res.status}`);
                    return res.json();
                })
                .then(data => {
                    loading.style.display = 'none';

                    if (!data || data.length === 0) {
                        container.innerHTML = `
                            <div class="empty-state">
                                <div class="empty-icon">📭</div>
                                <h3 class="empty-title">Hozircha murojatlar yo'q</h3>
                                <p class="empty-text">Hali hech qanday murojat qoldirilmagan</p>
                            </div>
                        `;
                        return;
                    }

                    allAppeals = data;
                    updateStatistics(data);
                    renderAppeals('all');
                })
                .catch(err => {
                    loading.style.display = 'none';
                    container.innerHTML = `
                        <div class="error-message">
                            <div class="error-icon">⚠️</div>
                            <h3 class="error-title">Ma'lumotlarni yuklashda xatolik</h3>
                            <p class="error-text">
                                Server bilan bog'lanishda muammo yuz berdi.<br>
                                <strong>Xatolik:</strong> ${err.message}
                            </p>
                        </div>
                    `;
                });
        }

        // Filter tabs event
        document.addEventListener('click', (e) => {
            if (e.target.closest('.filter-tab')) {
                const tab = e.target.closest('.filter-tab');
                const filter = tab.dataset.filter;

                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                currentFilter = filter;
                renderAppeals(filter, document.getElementById('searchInput').value);
            }
        });

        // Search event
        document.getElementById('searchInput').addEventListener('input', (e) => {
            renderAppeals(currentFilter, e.target.value);
        });

        // Add animation keyframe
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);

        // Load on page ready
        document.addEventListener('DOMContentLoaded', loadAppeals);
