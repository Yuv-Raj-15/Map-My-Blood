document.getElementById('signupForm').addEventListener('submit', async function(event) {
    event.preventDefault(); 

    
    const password = document.getElementById('passwordInput').value;
    const confirmPassword = document.getElementById('confirmPasswordInput').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    
    const locationStr = document.getElementById('locationInput').value;
    const [latitude, longitude] = locationStr.split(',').map(coord => coord.trim());

    
    const formData = {
        REG_NO: document.getElementById('regNoInput').value, 
        org_name: document.getElementById('orgNameInput').value, 
        email: document.getElementById('emailInput').value, 
        phone: document.getElementById('phoneInput').value, 
        pass_word: password,
        Latitude: parseFloat(latitude),
        Longitude: parseFloat(longitude),
        landmark: document.getElementById('landmarkInput').value,
        state: document.getElementById('stateSelect').value,
        address: document.getElementById('addressInput').value,
        city: document.getElementById('cityInput').value,
        pincode: parseInt(document.getElementById('pincodeInput').value)
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
