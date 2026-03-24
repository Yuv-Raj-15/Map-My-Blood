
window.addEventListener('DOMContentLoaded', function () {
    var p = new URLSearchParams(window.location.search);
    var loginTab    = document.getElementById('loginTab');
    var signupTab   = document.getElementById('signupTab');
    var loginForm   = document.getElementById('loginForm');
    var signupForm  = document.getElementById('signupForm');

    if (loginTab && signupTab && loginForm && signupForm) {
        if (p.get('tab') === 'signup') {
            loginTab.classList.remove('active');
            signupTab.classList.add('active');
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
        }

        loginTab.addEventListener('click', function () {
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
        });

        signupTab.addEventListener('click', function () {
            signupTab.classList.add('active');
            loginTab.classList.remove('active');
            signupForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        });
    }
});
