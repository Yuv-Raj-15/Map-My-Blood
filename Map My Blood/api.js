const API_BASE = 'server.php?action=';

function saveSession(token, userData, userType) {
  localStorage.setItem('mmb_token', token);
  localStorage.setItem('mmb_user', JSON.stringify(userData));
  localStorage.setItem('mmb_type', userType);
}

function getToken()    { return localStorage.getItem('mmb_token'); }
function getUser()     { return JSON.parse(localStorage.getItem('mmb_user') || 'null'); }
function getUserType() { return localStorage.getItem('mmb_type'); }

function logout() {
  localStorage.removeItem('mmb_token');
  localStorage.removeItem('mmb_user');
  localStorage.removeItem('mmb_type');
  window.location.href = 'HomePage.html';
}

function isLoggedIn() { return !!getToken(); }

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Something went wrong.');
    return data;
  } catch (err) {
    throw err;
  }
}

async function userLogin(email, password) {
  const data = await apiFetch('/auth/user/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  saveSession(data.token, data.user, 'user');
  return data;
}

async function userRegister(formData) {
  return await apiFetch('/auth/user/register', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
}

async function bloodBankLogin(email, password) {
  const data = await apiFetch('/auth/bloodbank/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  saveSession(data.token, data.bloodBank, 'bloodbank');
  return data;
}

async function bloodBankRegister(formData) {
  return await apiFetch('/auth/bloodbank/register', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
}

async function searchBloodAPI(blood_group, city = '', state = '') {
  let query = `?blood_group=${encodeURIComponent(blood_group)}`;
  if (city)  query += `&city=${encodeURIComponent(city)}`;
  if (state) query += `&state=${encodeURIComponent(state)}`;
  return await apiFetch(`/blood/search${query}`);
}

async function getBloodStock() {
  return await apiFetch('/blood/stock');
}

async function updateBloodStock(blood_group, units_available) {
  return await apiFetch('/blood/stock/update', {
    method: 'PUT',
    body: JSON.stringify({ blood_group, units_available }),
  });
}

async function getUserProfile() {
  return await apiFetch('/user/profile');
}

async function updateUserProfile(profileData) {
  return await apiFetch('/user/profile/update', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

async function getDonationHistory() {
  return await apiFetch('/user/donations');
}
