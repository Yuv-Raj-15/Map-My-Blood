// Homepage.js — Navigation logic for Map My Blood homepage

document.addEventListener("DOMContentLoaded", function () {

    // Login button → User/Bank selection screen (login mode)
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", function () {
            window.location.href = "AskUser.html?action=login";
        });
    }

    // Sign Up button → User/Bank selection screen (signup mode)
    const signupBtn = document.getElementById("signupBtn");
    if (signupBtn) {
        signupBtn.addEventListener("click", function () {
            window.location.href = "AskUser.html?action=signup";
        });
    }

});
