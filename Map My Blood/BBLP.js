window.addEventListener('DOMContentLoaded', function () {
    var p = new URLSearchParams(window.location.search);
    var loginTab = document.getElementById('loginTab');
    var signupTab = document.getElementById('signupTab');
    var loginForm = document.getElementById('loginForm');
    var signupForm = document.getElementById('signupForm');
    const pincodeInput = document.getElementById("pincodeInput");

    if (loginTab && signupTab && loginForm && signupForm) {
        if (p.get('tab') === 'signup') {
            activateTab('signup');
        }

        loginTab.addEventListener('click', function () { activateTab('login'); });
        signupTab.addEventListener('click', function () { activateTab('signup'); });
    }

    function activateTab(which) {
        if (which === 'signup') {
            loginTab.classList.remove('active');
            signupTab.classList.add('active');
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
        } else {
            signupTab.classList.remove('active');
            loginTab.classList.add('active');
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        }
    }

    var detectBtn = document.getElementById('detectLocationBtn');
    if (detectBtn) {
        detectBtn.addEventListener('click', function () {
            if (!navigator.geolocation) {
                showToast('Geolocation not supported by your browser.');
                return;
            }
            showToast('Detecting your location...');
            detectBtn.disabled = true;
            detectBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            navigator.geolocation.getCurrentPosition(
                function (pos) {
                    var lat = pos.coords.latitude.toFixed(6);
                    var lng = pos.coords.longitude.toFixed(6);

                    var latField = document.getElementById('latInput');
                    var lngField = document.getElementById('lngInput');
                    var displayField = document.getElementById('locationDisplay');

                    if (latField)  latField.value  = lat;
                    if (lngField)  lngField.value  = lng;
                    if (displayField) displayField.value = '\u2705 Lat: ' + lat + ', Lng: ' + lng;

                    showToast('Location detected! ✓');
                    setTimeout(hideToast, 2500);
                    detectBtn.disabled = false;
                    detectBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
                },
                function () {
                    showToast('Could not detect location. Please allow location access and try again.');
                    setTimeout(hideToast, 3500);
                    detectBtn.disabled = false;
                    detectBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
    }

    function showToast(msg) {
        var toast = document.getElementById('locationToast');
        var span = document.getElementById('toastMessage');
        if (!toast || !span) return;
        span.textContent = msg;
        toast.classList.remove('hidden');
    }

    function hideToast() {
        var toast = document.getElementById('locationToast');
        if (toast) toast.classList.add('hidden');
    }

    if (pincodeInput) {
        pincodeInput.addEventListener("input", (event) => {
            event.target.value = event.target.value.replace(/\D/g, "").slice(0, 6);
        });
    }
});


document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const regNo = document.getElementById('regnoinputlogin').value;
    const password = document.getElementById('passwordinputlogin').value;

    try {
        const response = await fetch('server.php?action=login-bloodbank', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                REG_NO: regNo, 
                pass_word: password 
            })
        });

        const result = await response.json();

       if (response.ok) {
            localStorage.setItem('loggedInRegNo', regNo);
            
            window.location.href = 'BloodBankDashBoard.html';
        }else {
            alert('Login Failed: ' + result.message);
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred connecting to the server.');
    }
});

var _bbOtpCallback = null;

function openBBOTPModal(onVerified) {
    _bbOtpCallback = onVerified;
    ['bbOtp1','bbOtp2','bbOtp3','bbOtp4'].forEach(function(id) { document.getElementById(id).value = ''; });
    document.getElementById('bbOtpError').textContent = '';
    var verifyBtn = document.getElementById('bbOtpVerifyBtn');
    verifyBtn.disabled = false;
    verifyBtn.innerHTML = 'Verify & Register <i class="fa-solid fa-arrow-right"></i>';
    document.getElementById('bbOtpOverlay').style.display = 'flex';
    document.getElementById('bbBlurBg').style.display = 'block';
    document.body.classList.remove('bb-otp-open');
    document.getElementById('bbOtp1').focus();
}

function verifyBBOTP() {
    var digits = ['bbOtp1','bbOtp2','bbOtp3','bbOtp4'].map(function(id) { return document.getElementById(id).value.trim(); });
    var code = digits.join('');
    if (code.length < 4) {
        document.getElementById('bbOtpError').textContent = '⚠️ Please enter all 4 digits.';
        return;
    }
    document.getElementById('bbOtpError').textContent = '';
    document.getElementById('bbOtpVerifyBtn').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';
    document.getElementById('bbOtpVerifyBtn').disabled = true;

    var cb = _bbOtpCallback;
    setTimeout(function() {
        document.getElementById('bbOtpOverlay').style.display = 'none';
        document.getElementById('bbBlurBg').style.display = 'none';
        document.body.classList.remove('bb-otp-open');
        _bbOtpCallback = null;
        if (cb) cb();
    }, 700);
}

(function setupBBOtpBoxes() {
    var boxes = document.querySelectorAll('.bb-otp-box');
    boxes.forEach(function(box, i) {
        box.addEventListener('input', function() {
            box.value = box.value.replace(/\D/g, '').slice(0, 1);
            if (box.value && i < boxes.length - 1) boxes[i + 1].focus();
        });
        box.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !box.value && i > 0) boxes[i - 1].focus();
            if (e.key === 'Enter') verifyBBOTP();
        });
    });
})();

document.getElementById('signupForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    var password        = document.getElementById('passwordinput').value;
    var confirmPassword = document.getElementById('confirmpasswordinput').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    var latitude  = document.getElementById('latInput')  ? parseFloat(document.getElementById('latInput').value)  : NaN;
    var longitude = document.getElementById('lngInput')  ? parseFloat(document.getElementById('lngInput').value) : NaN;

    if (isNaN(latitude) || isNaN(longitude) || !latitude || !longitude) {
        alert('⚠️ Location required! Please click the GPS button (📍) to detect your hospital location before registering.');
        return;
    }

    var formData = {
        REG_NO:   document.getElementById('regnoinput').value,
        org_name: document.getElementById('orgnameinput').value,
        email:    document.getElementById('emailinput').value,
        phone:    document.getElementById('phoneinput').value,
        pass_word: password,
        Latitude:  parseFloat(latitude),
        Longitude: parseFloat(longitude),
        landmark: document.getElementById('landmarkinput').value,
        state:    document.getElementById('stateinput').value,
        address:  document.getElementById('addressinput').value,
        city:     document.getElementById('cityinput').value,
        pincode:  parseInt(document.getElementById('pincodeinput').value)
    };

    openBBOTPModal(async function() {
        try {
            var response = await fetch('server.php?action=register-bloodbank', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            var result = await response.json();
            if (response.ok) {
                alert('✅ Blood Bank registered successfully!');
                document.getElementById('signupForm').reset();
                document.getElementById('latInput').value  = '';
                document.getElementById('lngInput').value  = '';
                document.getElementById('locationDisplay').value = '';
                document.getElementById('loginTab').click();
            } else {
                alert('Registration Failed: ' + result.message);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An error occurred connecting to the server.');
        }
    });
});
