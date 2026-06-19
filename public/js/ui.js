function initRevealAnimations() {
  const revealItems = document.querySelectorAll('[data-reveal]');

  if (!revealItems.length) {
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.14,
    rootMargin: '0px 0px -40px 0px'
  });

  revealItems.forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${index * 70}ms`);
    observer.observe(item);
  });
}

function initNavbarState() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) {
    return;
  }

  const syncNavbar = () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > 10);
  };

  syncNavbar();
  window.addEventListener('scroll', syncNavbar, { passive: true });
}

function initNewsletterForm() {
  const form = document.querySelector('.newsletter-form');
  const message = document.querySelector('[data-newsletter-message]');

  if (!form || !message) {
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    form.reset();
    message.textContent = 'Thanks for subscribing. Fresh drops and offers are on the way.';
    message.classList.add('is-visible');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('is-ready');
  initRevealAnimations();
  initNavbarState();
  initNewsletterForm();
});
