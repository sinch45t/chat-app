// public/js/signup.js
const socket = io();

function signup() {
  const usernameInput = document.getElementById('usernameInput').value;
  if (usernameInput.trim() !== '') {
    // Redirect to the chat page after signup
    window.location.href = `/index.html?username=${usernameInput}`;
  } else {
    alert('Please enter a valid username.');
  }
}
