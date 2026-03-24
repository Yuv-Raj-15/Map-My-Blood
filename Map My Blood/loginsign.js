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
            navigator.geolocation.getCurrentPosition(
                function (pos) {
                    var coords = pos.coords.latitude.toFixed(4) + ', ' + pos.coords.longitude.toFixed(4);
                    var input = document.getElementById('locationInput');
                    if (input) input.value = coords;
                    showToast('Location detected! ✓');
                    setTimeout(hideToast, 2500);
                },
                function () {
                    showToast('Could not detect location. Please type it.');
                    setTimeout(hideToast, 3000);
                }
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

document.getElementById('signupForm').addEventListener('submit', async function(event) {
    event.preventDefault(); 

    
    const password = document.getElementById('passwordinput').value;
    const confirmPassword = document.getElementById('confirmpasswordinput').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    
    const locationStr = document.getElementById('locationinput').value;
    const [latitude, longitude] = locationStr.split(',').map(coord => coord.trim());

    
    const formData = {
        REG_NO: document.getElementById('regnoinput').value, 
        org_name: document.getElementById('orgnameinput').value, 
        email: document.getElementById('emailinput').value, 
        phone: document.getElementById('phoneinput').value, 
        pass_word: password,
        Latitude: parseFloat(latitude),
        Longitude: parseFloat(longitude),
        landmark: document.getElementById('landmarkinput').value,
        state: document.getElementById('stateinput').value,
        address: document.getElementById('addressinput').value,
        city: document.getElementById('cityinput').value,
        pincode: parseInt(document.getElementById('pincodeinput').value)
    };

    try {
        const response = await fetch('server.php?action=register-bloodbank', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Blood Bank registered successfully!');
            document.getElementById('signupForm').reset(); 
        } else {
            
            alert('Registration Failed: ' + result.message);
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('An error occurred connecting to the server.');
    }
});
