const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const USERS_FILE = process.env.USERS_FILE || path.join(__dirname, 'users.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize users file if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
    const defaultUser = {
        id: 1,
        username: 'johndoe',
        email: 'john@example.com',
        fullName: 'John Doe',
        bio: 'Software developer passionate about coding',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&size=100'
    };
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUser, null, 2));
}

// Get user profile
app.get('/api/profile', (req, res) => {
    try {
        const userData = fs.readFileSync(USERS_FILE, 'utf8');
        const user = JSON.parse(userData);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read profile' });
    }
});

// Update user profile
app.put('/api/profile', (req, res) => {
    try {
        const updates = req.body;
        const userData = fs.readFileSync(USERS_FILE, 'utf8');
        const currentUser = JSON.parse(userData);

        // Merge updates with current user data
        const updatedUser = { ...currentUser, ...updates };

        // Write back to file
        fs.writeFileSync(USERS_FILE, JSON.stringify(updatedUser, null, 2));

        res.json({
            success: true,
            message: 'Profile updated successfully!',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
}

module.exports = { app };