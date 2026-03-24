const loginTab   = document.getElementById('loginTab');
const signupTab  = document.getElementById('signupTab');
const loginForm  = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

loginTab.addEventListener('click', () => {
  loginTab.classList.add('active');
  signupTab.classList.remove('active');
  loginForm.classList.remove('hidden');
  signupForm.classList.add('hidden');
});

signupTab.addEventListener('click', () => {
  signupTab.classList.add('active');
  loginTab.classList.remove('active');
  signupForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
});

function showMsg(elementId, message, isError = true) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.style.color = isError ? '#e74c3c' : '#27ae60';
  el.style.fontWeight = '500';
  el.style.margin = '8px 0';
}

function setLoading(btnId, loading, defaultText) {
  const btn = document.getElementById(btnId);
  btn.disabled = loading;
  btn.innerHTML = loading
    ? '<i class="fa-solid fa-spinner fa-spin"></i> Please wait...'
    : defaultText;
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  showMsg('loginMsg', '');
  setLoading('loginBtn', true, 'Login');

  try {
    const response = await fetch('server.php?action=login-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');

    localStorage.setItem('mmb_token', data.token);
    localStorage.setItem('mmb_user', JSON.stringify(data.user));
    localStorage.setItem('mmb_type', 'user');

    showMsg('loginMsg', '✅ Login successful! Redirecting...', false);
    setTimeout(() => { window.location.href = 'UserDashBoard.html'; }, 1000);

  } catch (err) {
    showMsg('loginMsg', '❌ ' + err.message);
  } finally {
    setLoading('loginBtn', false, 'Login');
  }
});


let _otpCallback = null;

function openOTPModal(onVerified) {
  _otpCallback = onVerified;
  ['otp1','otp2','otp3','otp4'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('otpError').textContent = '';
  document.getElementById('otpOverlay').style.display = 'flex';
  document.getElementById('otpBlurBg').style.display = 'block';
  document.body.classList.remove('otp-open');
  document.getElementById('otp1').focus();
}

function closeOTPModal() {
  document.getElementById('otpOverlay').style.display = 'none';
  _otpCallback = null;
}

function verifyOTP() {
  const digits = ['otp1','otp2','otp3','otp4'].map(id => document.getElementById(id).value.trim());
  const code = digits.join('');
  if (code.length < 4) {
    document.getElementById('otpError').textContent = '⚠️ Please enter all 4 digits.';
    return;
  }
  document.getElementById('otpError').textContent = '';
  document.getElementById('otpVerifyBtn').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';
  document.getElementById('otpVerifyBtn').disabled = true;

  const cb = _otpCallback;
  setTimeout(() => {
    document.getElementById('otpOverlay').style.display = 'none';
    document.getElementById('otpBlurBg').style.display = 'none';
    document.body.classList.remove('otp-open');
    _otpCallback = null;
    if (cb) cb();
  }, 700);
}

(function setupOtpBoxes() {
  const boxes = document.querySelectorAll('.otp-box');
  boxes.forEach((box, i) => {
    box.addEventListener('input', () => {
      box.value = box.value.replace(/\D/g, '').slice(0, 1);
      if (box.value && i < boxes.length - 1) boxes[i + 1].focus();
    });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !box.value && i > 0) boxes[i - 1].focus();
      if (e.key === 'Enter') verifyOTP();
    });
  });

  const p = new URLSearchParams(window.location.search);
  if (p.get('tab') === 'signup') {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  }
})();


signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const user_name  = document.getElementById('signupName').value.trim();
  const email      = document.getElementById('signupEmail').value.trim();
  const phone      = document.getElementById('signupPhone').value.trim();
  const pass_word  = document.getElementById('signupPassword').value;
  const confirmPwd = document.getElementById('signupConfirmPassword').value;

  showMsg('signupMsg', '');

  if (!user_name) { showMsg('signupMsg', '❌ Please enter your name.'); return; }
  if (!email)     { showMsg('signupMsg', '❌ Please enter your email.'); return; }
  if (!pass_word) { showMsg('signupMsg', '❌ Please enter a password.'); return; }
  if (pass_word !== confirmPwd) { showMsg('signupMsg', '❌ Passwords do not match.'); return; }
  if (pass_word.length < 6)    { showMsg('signupMsg', '❌ Password must be at least 6 characters.'); return; }

  openOTPModal(async () => {
    setLoading('signupBtn', true, 'Sign Up');
    try {
      const response = await fetch('server.php?action=register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name, email, phone, pass_word })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      showMsg('signupMsg', '✅ Registered successfully! Please log in.', false);
      signupForm.reset();
      setTimeout(() => {
        loginTab.click();
        document.getElementById('loginEmail').value = email;
      }, 1500);
    } catch (err) {
      showMsg('signupMsg', '❌ ' + (err.message || 'Registration failed. Please try again.'));
    } finally {
      setLoading('signupBtn', false, 'Sign Up');
    }
  });
});

if (localStorage.getItem('mmb_token') && localStorage.getItem('mmb_type') === 'user') {
  window.location.href = 'UserDashBoard.html';
}
