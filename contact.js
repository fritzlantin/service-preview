document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!form || !status) return;

  if (form.action.includes('YOUR_FORM_ID')) {
    // eslint-disable-next-line no-console
    console.warn(
      'Contact form: replace YOUR_FORM_ID in contact.html with your real ' +
      'Formspree endpoint (formspree.io) before this form can send email.'
    );
  }

  function showStatus(message, kind) {
    status.textContent = message;
    status.className = `form-status is-visible is-${kind}`;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    status.className = 'form-status';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        form.reset();
        showStatus("Thanks — your message is on its way.", 'success');
      } else {
        const data = await response.json().catch(() => null);
        const detail = data && Array.isArray(data.errors)
          ? data.errors.map((e) => e.message).join(', ')
          : null;
        showStatus(detail || 'Something went wrong — please try emailing me directly.', 'error');
      }
    } catch (err) {
      showStatus('Network error — please try emailing me directly.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
});
