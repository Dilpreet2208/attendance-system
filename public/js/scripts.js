// Register User
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, password }),
    });
  
    if (response.ok) {
      alert('Registration successful!');
      window.location.href = 'login.html';
    } else {
      alert('Registration failed: ' + (await response.text()));
    }
  });
  
  // Login User
  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
  
    if (response.ok) {
      alert('Login successful!');
      window.location.href = 'dashboard.html';// Redirect to dashboard or another page
    } else {
      alert('Login failed: ' + (await response.text()));
    }
  });

  // Mark Attendance
  document.getElementById('mark-attendance')?.addEventListener('click', async () => {
    const response = await fetch('/attendance/mark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      alert('Attendance marked successfully');
    } else {
      const errorMessage = await response.text();
      alert(errorMessage);
    }
  });

  // Sign Off
  document.getElementById('sign-off')?.addEventListener('click', async () => {
    const response = await fetch('/attendance/signoff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      alert('Signed off successfully');
      const response = await fetch('/auth/logout', {
        method: 'POST',
      });
  
      if (response.ok) {
        alert('Logged out successfully');
        window.location.href = 'login.html'; // Redirect back to login
      } else {
        alert('Failed to log out');
      }
    } else {
      alert('Failed to sign off');
    }
  });
  
  // Logout
  document.getElementById('logout')?.addEventListener('click', async () => {
    const response = await fetch('/auth/logout', {
      method: 'POST',
    });

    if (response.ok) {
      alert('Logged out successfully');
      window.location.href = 'login.html'; // Redirect back to login
    } else {
      alert('Failed to log out');
    }
  });

  // Forgot Password
  document.getElementById('reset-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
  
    const response = await fetch('/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
  
    if (response.ok) {
      alert('Reset link sent to your email!');
    } else {
      alert('Failed to send reset link: ' + (await response.text()));
    }
  });
  