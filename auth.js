// DOM elements
const formTitle = document.getElementById('form-title');
const authForm = document.getElementById('authForm');
const usernameGroup = document.getElementById('username-group');
const submitBtn = document.getElementById('submit-btn');
const toggleLink = document.getElementById('toggle-link');
const messageEl = document.getElementById('message');

let isLogin = false;
const response = await fetch(`auth.php?action=${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
});
// Toggle between Register and Login
toggleLink.addEventListener('click', () => {
  isLogin = !isLogin;

  if (isLogin) {
    formTitle.textContent = 'Login';
    submitBtn.textContent = 'Login';
    toggleLink.textContent = "Don't have an account? Register instead";
    usernameGroup.style.display = 'none';
    authForm.username.value = '';
  } else {
    formTitle.textContent = 'Register';
    submitBtn.textContent = 'Register';
    toggleLink.textContent = 'Already have an account? Login instead';
    usernameGroup.style.display = 'block';
  }
  clearMessage();
  authForm.reset();
});

// Handle form submission
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessage();

  const email = authForm.email.value.trim();
  const password = authForm.password.value.trim();
  const username = authForm.username.value.trim();

  if (!email) return showMessage('Email is required.', 'error');
  if (!password || password.length < 6)
    return showMessage('Password must be at least 6 characters.', 'error');
  if (!isLogin && !username)
    return showMessage('Username is required for registration.', 'error');

  const endpoint = isLogin ? 'login' : 'register';
  const data = isLogin
    ? { email, password }
    : { username, email, password };

  try {
    const response = await fetch(`auth.php?action=${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      showMessage(result.message, 'success');

      if (result.token) {
        localStorage.setItem('token', result.token);
        // Redirect if needed:
        // window.location.href = 'profile.html';
      }

      authForm.reset();
    } else {
      showMessage(result.message || 'Something went wrong', 'error');
    }
  } catch (err) {
    showMessage('Error connecting to server', 'error');
    console.error(err);
  }
});

// Helper functions
function showMessage(msg, type) {
  messageEl.textContent = msg;
  messageEl.className = `message ${type}`;
  messageEl.style.display = 'block';
}

function clearMessage() {
  messageEl.textContent = '';
  messageEl.className = 'message';
  messageEl.style.display = 'none';
}
