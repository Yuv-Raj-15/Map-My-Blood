const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

const detectBtn = document.getElementById('detectLocationBtn');
const locationInput = document.getElementById('locationInput');
const locationToast = document.getElementById('locationToast');
const toastMessage = document.getElementById('toastMessage');

// 1. Tab Switching Logic
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

// 2. Geolocation Feature
detectBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        showToast("Geolocation is not supported by your browser.");
        return;
    }

    // Show "Detecting location..." notification
    showToast("Detecting location...");

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            // In a real app, you could use a Reverse Geocoding API here
            locationInput.value = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            showToast("Location captured successfully!");
            
            // Optional: Auto-hide toast after success
            setTimeout(hideToast, 3000);
        },
        (error) => {
            showToast("Error: Please allow location access.");
            setTimeout(hideToast, 4000);
        }
    );
});

// Helper functions for UI Feedback
function showToast(message) {
    toastMessage.textContent = message;
    locationToast.classList.remove('hidden');
}

function hideToast() {
    locationToast.classList.add('hidden');
}