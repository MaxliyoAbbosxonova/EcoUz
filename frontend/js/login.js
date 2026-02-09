
    // API Configuration
    const API_BASE_URL = 'http://localhost:8000/api/v1'; // O'z backend manzilingizni yozing

    const defaultConfig = {
      app_title: "EkoUz",
      app_tagline: "Ekologik monitoring tizimi",
      login_title: "Tizimga kirish",
      login_subtitle: "Login va parolingizni kiriting"
    };

    let resetPhoneNumber = null;

    // Initialize SDK
    if (window.elementSdk) {
      window.elementSdk.init({
        defaultConfig,
        onConfigChange: async (config) => {
          document.getElementById('appTitle').textContent = config.app_title || defaultConfig.app_title;
          document.getElementById('appTagline').textContent = config.app_tagline || defaultConfig.app_tagline;
          document.getElementById('loginTitle').textContent = config.login_title || defaultConfig.login_title;
          document.getElementById('loginSubtitle').textContent = config.login_subtitle || defaultConfig.login_subtitle;
        },
        mapToCapabilities: (config) => ({
          recolorables: [],
          borderables: [],
          fontEditable: undefined,
          fontSizeable: undefined
        }),
        mapToEditPanelValues: (config) => new Map([
          ["app_title", config.app_title || defaultConfig.app_title],
          ["app_tagline", config.app_tagline || defaultConfig.app_tagline],
          ["login_title", config.login_title || defaultConfig.login_title],
          ["login_subtitle", config.login_subtitle || defaultConfig.login_subtitle]
        ])
      });
    }

    // Show Forgot Password
    document.getElementById('forgotPasswordBtn').addEventListener('click', function() {
      document.getElementById('loginContent').classList.remove('active');
      document.getElementById('resetPasswordSection').classList.add('active');
      document.getElementById('sendSmsStep').style.display = 'block';
      document.getElementById('verifyCodeStep').style.display = 'none';
      hideError();
      hideSuccess();
    });

    // Back to Login
    document.getElementById('backToLoginBtn').addEventListener('click', function() {
      document.getElementById('resetPasswordSection').classList.remove('active');
      document.getElementById('loginContent').classList.add('active');
      resetPhoneNumber = null;
      hideError();
      hideSuccess();
    });

    // Login Form Submit
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
      e.preventDefault();

      const login = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value;

      if (!login || !password) {
        showError('Login va parolni kiriting!');
        return;
      }

      try {
        showLoading('Tizimga kirilmoqda...');

        const response = await fetch(`${API_BASE_URL}/users/login/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ login, password })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || data.non_field_errors?.[0] || 'Login yoki parol noto\'g\'ri');
        }

        // Save tokens
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));

        hideLoading();
        showSuccess('Tizimga muvaffaqiyatli kirdingiz! ✅');

        // Reset form
        document.getElementById('loginForm').reset();


        setTimeout(() => {
  const user = JSON.parse(localStorage.getItem("user")); // yoki response'dan to‘g‘ridan
  console.log(user)
  if (user.role === "OPERATOR") {
    window.location.href = "assign.html";
  } else if (user.role === "EXECUTOR"  ){
    window.location.href = "exe_done.html";
  }
}, 1500);

      } catch (error) {
        hideLoading();
        showError(error.message);
        console.error('Login error:', error);
      }
    });

    // Send SMS Form Submit
    document.getElementById('sendSmsForm').addEventListener('submit', async function(e) {
      e.preventDefault();

      const phone = document.getElementById('resetPhone').value.trim();

      if (!phone) {
        showError('Telefon raqamni kiriting!');
        return;
      }

      // Format phone
      let phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.startsWith('998')) {
        phoneDigits = phoneDigits.substring(3);
      }

      if (phoneDigits.length < 9) {
        showError('Telefon raqam noto\'g\'ri formatda!');
        return;
      }

      try {
        showLoading('SMS kod yuborilmoqda...');

        const response = await fetch(`${API_BASE_URL}/users/send_sms/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ phone: phoneDigits })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || data.phone?.[0] || 'SMS yuborishda xatolik');
        }

        resetPhoneNumber = phoneDigits;

        hideLoading();
        showSuccess('SMS kod yuborildi! Kodni kiriting. ✅');

        // Show verify code step
        document.getElementById('sendSmsStep').style.display = 'none';
        document.getElementById('verifyCodeStep').style.display = 'block';

        document.getElementById('sendSmsForm').reset();

      } catch (error) {
        hideLoading();
        showError(error.message);
        console.error('Send SMS error:', error);
      }
    });

    // Reset Password Form Submit
    document.getElementById('resetPasswordForm').addEventListener('submit', async function(e) {
      e.preventDefault();

      const code = document.getElementById('smsCode').value.trim();
      const newPassword = document.getElementById('newPassword').value;

      if (!code || !newPassword) {
        showError('Barcha maydonlarni to\'ldiring!');
        return;
      }

      if (!resetPhoneNumber) {
        showError('Telefon raqam topilmadi. Qaytadan urinib ko\'ring.');
        return;
      }

      try {
        showLoading('Parol o\'zgartirilmoqda...');

        const response = await fetch(`${API_BASE_URL}/users/reset_password/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            phone: resetPhoneNumber,
            code: parseInt(code),
            new_password: newPassword
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || data.code?.[0] || 'Parol o\'zgartirishda xatolik');
        }

        // Auto login after password reset
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));

        hideLoading();
        showSuccess('Parol muvaffaqiyatli o\'zgartirildi! ✅');

        // Reset form and go back to login
        document.getElementById('resetPasswordForm').reset();
        resetPhoneNumber = null;

        setTimeout(() => {
          document.getElementById('backToLoginBtn').click();
        }, 1500);

      } catch (error) {
        hideLoading();
        showError(error.message);
        console.error('Reset password error:', error);
      }
    });

    // Helper Functions
    function showError(message) {
      hideSuccess();
      const errorDiv = document.getElementById('errorMessage');
      const errorText = document.getElementById('errorText');
      errorText.textContent = message;
      errorDiv.classList.add('active');

      setTimeout(() => {
        errorDiv.classList.remove('active');
      }, 5000);
    }

    function hideError() {
      document.getElementById('errorMessage').classList.remove('active');
    }

    function showSuccess(message) {
      hideError();
      const successDiv = document.getElementById('successMessage');
      const successText = document.getElementById('successText');
      successText.textContent = message;
      successDiv.classList.add('active');

      setTimeout(() => {
        successDiv.classList.remove('active');
      }, 5000);
    }

    function hideSuccess() {
      document.getElementById('successMessage').classList.remove('active');
    }

    function showLoading(text) {
      document.getElementById('loadingText').textContent = text;
      document.getElementById('loadingOverlay').classList.add('active');
    }

    function hideLoading() {
      document.getElementById('loadingOverlay').classList.remove('active');
    }
    document.getElementById("backHomeBtn").addEventListener("click", () => {
  window.location.href = "index.html";
});