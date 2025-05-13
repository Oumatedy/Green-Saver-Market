// Mobile menu toggle
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
  menuToggle.setAttribute('aria-expanded', !expanded);
  navMenu.classList.toggle('open');
});

// Simple newsletter form validation and feedback
const subscribeForm = document.getElementById('subscribe-form');
const emailInput = document.getElementById('email');
const formMessage = document.getElementById('form-message');

subscribeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();

  if (!validateEmail(email)) {
    formMessage.textContent = 'Please enter a valid email address.';
    formMessage.style.color = 'red';
    emailInput.focus();
    return;
  }

  formMessage.textContent = 'Thank you for subscribing!';
  formMessage.style.color = 'green';
  subscribeForm.reset();
});

function validateEmail(email) {
  // Basic email regex
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.toLowerCase());
}

// Placeholder for cart count update (static zero here)
const cartLink = document.querySelector('a[href="cart.html"]');
cartLink.textContent = 'Cart (0)';

// script.js

// Load footer.html dynamically into #footer-placeholder
document.addEventListener("DOMContentLoaded", () => {
  fetch("footer.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("footer-placeholder").innerHTML = data;
    })
    .catch(error => console.error("Error loading footer:", error));
});

