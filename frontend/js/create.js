
    // API Configuration - O'zgartiring!
    const API_BASE_URL = 'http://localhost:8000/api/v1'; // O'z backend manzilingizni yozing

    const defaultConfig = {
      header_title: "EkoUz",
      header_tagline: "Ekologik muammolarni hal qilish platformasi",
      form_title: "Murojaat Yuborish",
      form_subtitle: "Ekologik muammo haqida batafsil ma'lumot bering. Biz tez orada ko'rib chiqamiz.",
      fullname_label: "To'liq ism",
      phone_label: "Telefon raqam",
      region_label: "Viloyat",
      district_label: "Tuman",
      description_label: "Muammo tavsifi",
      image_label: "Rasm yuklash",
      location_label: "Joylashuv",
      map_text: "Xaritada joyni belgilang",
      map_hint: "Xaritani bosing yoki geolokatsiyadan foydalaning",
      upload_text: "Rasm yuklash uchun bosing yoki sudrab olib keling",
      upload_hint: "JPG, PNG (maksimal 5MB)",
      submit_button_text: "📤 Murojaat Yuborish",
      back_button_text: "← Bosh sahifa",
      success_title: "Muvaffaqiyatli yuborildi!",
      success_message: "Murojaatingiz qabul qilindi. Tez orada ko'rib chiqamiz va sizga xabar beramiz."
    };

    let selectedFile = null;
    let selectedLocation = null;

    // Initialize SDK
    if (window.elementSdk) {
      window.elementSdk.init({
        defaultConfig,
        onConfigChange: async (config) => {
          document.getElementById('headerTitle').textContent = config.header_title || defaultConfig.header_title;
          document.getElementById('headerTagline').textContent = config.header_tagline || defaultConfig.header_tagline;
          document.getElementById('formTitle').textContent = config.form_title || defaultConfig.form_title;
          document.getElementById('formSubtitle').textContent = config.form_subtitle || defaultConfig.form_subtitle;
          document.getElementById('fullnameLabel').textContent = config.fullname_label || defaultConfig.fullname_label;
          document.getElementById('phoneLabel').textContent = config.phone_label || defaultConfig.phone_label;
          document.getElementById('regionLabel').textContent = config.region_label || defaultConfig.region_label;
          document.getElementById('districtLabel').textContent = config.district_label || defaultConfig.district_label;
          document.getElementById('descriptionLabel').textContent = config.description_label || defaultConfig.description_label;
          document.getElementById('imageLabel').textContent = config.image_label || defaultConfig.image_label;
          document.getElementById('locationLabel').textContent = config.location_label || defaultConfig.location_label;
          document.getElementById('mapText').textContent = config.map_text || defaultConfig.map_text;
          document.getElementById('mapHint').textContent = config.map_hint || defaultConfig.map_hint;
          document.getElementById('uploadText').textContent = config.upload_text || defaultConfig.upload_text;
          document.getElementById('uploadHint').textContent = config.upload_hint || defaultConfig.upload_hint;
          document.getElementById('submitButtonText').textContent = config.submit_button_text || defaultConfig.submit_button_text;
          document.getElementById('backButton').textContent = config.back_button_text || defaultConfig.back_button_text;
          document.getElementById('successTitle').textContent = config.success_title || defaultConfig.success_title;
          document.getElementById('successMessage').textContent = config.success_message || defaultConfig.success_message;
        },
        mapToCapabilities: (config) => ({
          recolorables: [],
          borderables: [],
          fontEditable: undefined,
          fontSizeable: undefined
        }),
        mapToEditPanelValues: (config) => new Map([
          ["header_title", config.header_title || defaultConfig.header_title],
          ["header_tagline", config.header_tagline || defaultConfig.header_tagline],
          ["form_title", config.form_title || defaultConfig.form_title],
          ["form_subtitle", config.form_subtitle || defaultConfig.form_subtitle],
          ["submit_button_text", config.submit_button_text || defaultConfig.submit_button_text]
        ])
      });
    }

    // Load Regions on page load
    async function loadRegions() {
      try {
        showLoading('Viloyatlar yuklanmoqda...');
        const response = await fetch(`${API_BASE_URL}/regions/`);

        if (!response.ok) {
          throw new Error('Viloyatlarni yuklashda xatolik');
        }

        const regions = await response.json();
        const regionSelect = document.getElementById('region');

        regions.forEach(region => {
          const option = document.createElement('option');
          option.value = region.id;
          option.textContent = region.name;
          regionSelect.appendChild(option);
        });

        hideLoading();
      } catch (error) {
        hideLoading();
        showError('Viloyatlarni yuklashda xatolik yuz berdi. Iltimos sahifani yangilang.');
        console.error('Error loading regions:', error);
      }
    }

    // Load Districts when region is selected
    document.getElementById('region').addEventListener('change', async function() {
      const regionId = this.value;
      const districtSelect = document.getElementById('district');

      // Reset district
      districtSelect.innerHTML = '<option value="">Tumanni tanlang</option>';
      districtSelect.disabled = true;

      if (!regionId) return;

      try {
        showLoading('Tumanlar yuklanmoqda...');
        const response = await fetch(`${API_BASE_URL}/districts/?region_id=${regionId}`);

        if (!response.ok) {
          throw new Error('Tumanlarni yuklashda xatolik');
        }

        const districts = await response.json();

        districts.forEach(district => {
          const option = document.createElement('option');
          option.value = district.id;
          option.textContent = district.name;
          districtSelect.appendChild(option);
        });

        districtSelect.disabled = false;
        hideLoading();
      } catch (error) {
        hideLoading();
        showError('Tumanlarni yuklashda xatolik yuz berdi.');
        console.error('Error loading districts:', error);
      }
    });

    // File Upload Handlers
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('imageFile');
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    const removeImageBtn = document.getElementById('removeImage');

    fileUploadArea.addEventListener('click', () => fileInput.click());

    fileUploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileUploadArea.classList.add('dragover');
    });

    fileUploadArea.addEventListener('dragleave', () => {
      fileUploadArea.classList.remove('dragover');
    });

    fileUploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      fileUploadArea.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
      }
    });

    function handleFileSelect(file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        showError('Faqat JPG, JPEG yoki PNG formatdagi rasmlar qabul qilinadi!');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('Rasm hajmi 5MB dan oshmasligi kerak!');
        return;
      }

      selectedFile = file;

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImage.src = e.target.result;
        imagePreview.classList.add('active');
        fileUploadArea.style.display = 'none';
      };
      reader.readAsDataURL(file);
    }

    removeImageBtn.addEventListener('click', () => {
      selectedFile = null;
      fileInput.value = '';
      imagePreview.classList.remove('active');
      fileUploadArea.style.display = 'block';
    });

    // Map Location Handler - Get Current Location
    const mapContainer = document.getElementById('mapContainer');
    const coordinatesDisplay = document.getElementById('coordinatesDisplay');
    const coordinatesText = document.getElementById('coordinatesText');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');

    mapContainer.addEventListener('click', () => {
      if (navigator.geolocation) {
        showLoading('Joylashuvingiz aniqlanmoqda...');
        navigator.geolocation.getCurrentPosition(
          (position) => {
            hideLoading();
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setLocation(lat, lng);
          },
          (error) => {
            hideLoading();
            showError('Joylashuvni aniqlab bo\'lmadi. Iltimos, brauzerda geolokatsiyani yoqing.');
            console.error('Geolocation error:', error);
          }
        );
      } else {
        showError('Brauzeringiz geolokatsiyani qo\'llab-quvvatlamaydi.');
      }
    });

    function setLocation(lat, lng) {
      selectedLocation = { latitude: lat, longitude: lng };
      latitudeInput.value = parseFloat(lat).toFixed(6);
      longitudeInput.value = parseFloat(lng).toFixed(6);

      coordinatesText.textContent = `Koordinatalar: ${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`;
      coordinatesDisplay.classList.add('active');

      // Change map appearance to show it's selected
      mapContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #ecfdf5;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
          <div style="font-weight: 600; color: #059669; margin-bottom: 0.5rem;">Joylashuv aniqlandi</div>
          <div style="font-size: 0.875rem; color: #10b981;">Koordinatalar yuqorida ko'rsatilgan</div>
          <div style="font-size: 0.75rem; color: #6b7280; margin-top: 0.5rem;">Qayta aniqlash uchun bosing</div>
        </div>
      `;
    }

// Modalni ko'rsatish
function showSuccessModal() {
    const modal = document.getElementById("successModal");
    modal.style.display = "block";

    // 2 soniyadan keyin avtomatik yo'naltirish
    setTimeout(() => {
        window.location.href = "appeals.html"; // Shu yerga murojaatlar page URL
    }, 2000); // 2000ms = 2 soniya
}

// "Yaxshi" tugmasi bosilganda ham yo'naltirish
document.getElementById("closeSuccessModal").addEventListener("click", function() {
    window.location.href = "appeals.html"; // Shu yerga murojaatlar page URL
});

    // Form Submit
    document.getElementById('applicationForm').addEventListener('submit', async function(e) {
      e.preventDefault();

      // Validate required fields
      const fullname = document.getElementById('fullname').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const region = document.getElementById('region').value;
      const description = document.getElementById('description').value.trim();
      const district = document.getElementById('district').value;

      if (!fullname || !phone || !region) {
        showError('Iltimos, barcha majburiy maydonlarni to\'ldiring!');
        return;
      }

      if (!selectedLocation) {
        showError('Iltimos, xaritada joylashuvni belgilang!');
        return;
      }

      // Format phone number (remove all non-digits and ensure it starts without 998)
      let phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.startsWith('998')) {
        phoneDigits = phoneDigits.substring(3);
      }

      if (phoneDigits.length < 9) {
        showError('Telefon raqam noto\'g\'ri formatda! Kamida 9 raqam bo\'lishi kerak.');
        return;
      }

      // Prepare FormData
      const formData = new FormData();
      formData.append('fullname', fullname);
      formData.append('phone', phoneDigits);
      formData.append('region', region);
      if (district) {
        formData.append('district', district);
      }
      if (description) {
        formData.append('description', description);
      }
      formData.append('latitude', selectedLocation.latitude);
      formData.append('longitude', selectedLocation.longitude);

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      try {
        showLoading('Murojaat yuborilmoqda...');

        const response = await fetch(`${API_BASE_URL}/applications/`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Murojaat yuborishda xatolik');
        }

        const result = await response.json();

        hideLoading();

        // Show success modal
        document.getElementById('successModal').classList.add('active');

        // Reset form
        document.getElementById('applicationForm').reset();
        selectedFile = null;
        selectedLocation = null;
        imagePreview.classList.remove('active');
        fileUploadArea.style.display = 'block';
        coordinatesDisplay.classList.remove('active');
        document.getElementById('district').disabled = true;

        // Reset map
        mapContainer.innerHTML = `
          <div class="map-placeholder">
            <div class="map-icon">🗺️</div>
            <div class="map-text">${defaultConfig.map_text}</div>
            <div class="map-hint">${defaultConfig.map_hint}</div>
          </div>
        `;

      } catch (error) {
        hideLoading();
        showError('Murojaat yuborishda xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.');
        console.error('Error submitting application:', error);
      }
    });

    // Close Success Modal
    document.getElementById('closeSuccessModal').addEventListener('click', () => {
      document.getElementById('successModal').classList.remove('active');
    });

    // Helper Functions
    function showError(message) {
      const errorDiv = document.getElementById('errorMessage');
      const errorText = document.getElementById('errorText');
      errorText.textContent = '❌ ' + message;
      errorDiv.classList.add('active');

      // Auto hide after 5 seconds
      setTimeout(() => {
        errorDiv.classList.remove('active');
      }, 5000);
    }

    function showLoading(text) {
      document.getElementById('loadingText').textContent = text;
      document.getElementById('loadingOverlay').classList.add('active');
    }

    function hideLoading() {
      document.getElementById('loadingOverlay').classList.remove('active');
    }

    // Initialize - Load regions on page load
    loadRegions();