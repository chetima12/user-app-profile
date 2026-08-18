const API_URL = 'http://localhost:3000/api/profile';

// Load profile on page load
document.addEventListener('DOMContentLoaded', loadProfile);

// Handle form submission
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        fullName: document.getElementById('fullName').value,
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        bio: document.getElementById('bio').value
    };
    
    await updateProfile(formData);
});

// Load profile from backend
async function loadProfile() {
    try {
        const response = await fetch(API_URL);
        const user = await response.json();
        
        // Populate form fields
        document.getElementById('fullName').value = user.fullName || '';
        document.getElementById('username').value = user.username || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('bio').value = user.bio || '';
        
        // Update avatar
        if (user.avatar) {
            document.getElementById('avatarPreview').src = user.avatar;
        }
        
        showStatus('Profile loaded successfully!', 'success');
    } catch (error) {
        showStatus('Failed to load profile', 'error');
        console.error('Load error:', error);
    }
}

// Update profile
async function updateProfile(data) {
    try {
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showStatus('✅ Profile updated successfully!', 'success');
            // Update avatar if it changed
            if (result.user && result.user.avatar) {
                document.getElementById('avatarPreview').src = result.user.avatar;
            }
        } else {
            showStatus('❌ Error: ' + result.error, 'error');
        }
    } catch (error) {
        showStatus('❌ Failed to connect to server', 'error');
        console.error('Update error:', error);
    }
}

// Generate random avatar
async function generateAvatar() {
    const name = document.getElementById('fullName').value || 'User';
    const encodedName = encodeURIComponent(name);
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodedName}&size=100&background=667eea&color=fff&font-size=0.5`;
    
    // Update avatar in UI
    document.getElementById('avatarPreview').src = avatarUrl;
    
    // Save avatar to backend
    try {
        await updateProfile({ avatar: avatarUrl });
    } catch (error) {
        showStatus('Failed to update avatar', 'error');
    }
}

// Show status message
function showStatus(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    statusDiv.classList.remove('hidden');
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        statusDiv.classList.add('hidden');
    }, 4000);
}