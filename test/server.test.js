const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'user-profile-app-'));
const testUsersFile = path.join(tempDir, 'users.json');

process.env.USERS_FILE = testUsersFile;

const { app } = require('../server');

function getServerUrl(server) {
  const { port } = server.address();
  return `http://127.0.0.1:${port}`;
}

function seedUserProfile() {
  const defaultUser = {
    id: 1,
    username: 'johndoe',
    email: 'john@example.com',
    fullName: 'John Doe',
    bio: 'Software developer passionate about coding',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&size=100'
  };

  fs.writeFileSync(testUsersFile, JSON.stringify(defaultUser, null, 2));
}

test.beforeEach(() => {
  seedUserProfile();
});

test('GET /api/profile returns the stored user profile', async () => {
  const server = app.listen(0);

  try {
    const response = await fetch(`${getServerUrl(server)}/api/profile`);
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.username, 'johndoe');
    assert.equal(data.email, 'john@example.com');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('PUT /api/profile updates profile fields and persists them', async () => {
  const server = app.listen(0);

  try {
    const response = await fetch(`${getServerUrl(server)}/api/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio: 'Updated bio', fullName: 'Jane Doe' }),
    });

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.user.bio, 'Updated bio');
    assert.equal(body.user.fullName, 'Jane Doe');

    const profileResponse = await fetch(`${getServerUrl(server)}/api/profile`);
    const profile = await profileResponse.json();
    assert.equal(profile.bio, 'Updated bio');
    assert.equal(profile.fullName, 'Jane Doe');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
