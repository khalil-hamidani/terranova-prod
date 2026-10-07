document.addEventListener('DOMContentLoaded', () => {
  // Filter buttons
  const filterButtons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterType = btn.getAttribute('data-filter');

      cards.forEach(card => {
        if (!filterType || filterType === 'all') {
          card.style.display = 'flex';
        } else if (filterType === 'desktop' || filterType === 'mobile') {
          card.style.display = card.getAttribute('data-type') === filterType ? 'flex' : 'none';
        } else if (filterType === 'light' || filterType === 'dark') {
          card.style.display = card.getAttribute('data-theme') === filterType ? 'flex' : 'none';
        } else if (filterType === 'rtl') {
          card.style.display = card.getAttribute('data-dir') === 'rtl' ? 'flex' : 'none';
        }
      });
    });
  });

  // Modal zoom on card image click
  document.querySelectorAll('.img-wrap').forEach(wrap => {
    wrap.addEventListener('click', () => {
      const img = wrap.querySelector('img');
      if (img) openModal(img.src);
    });
  });

  // Copy path buttons
  document.querySelectorAll('.btn-copy-path').forEach(btn => {
    btn.addEventListener('click', () => {
      const relPath = btn.getAttribute('data-path');
      if (relPath) {
        navigator.clipboard.writeText(relPath).then(() => {
          const originalText = btn.textContent;
          btn.textContent = '✓ Copié !';
          setTimeout(() => { btn.textContent = originalText; }, 1500);
        });
      }
    });
  });

  // Lightbox close
  const modal = document.getElementById('modal');
  if (modal) {
    modal.addEventListener('click', closeModal);
  }
});

function openModal(src) {
  const modal = document.getElementById('modal');
  const img = document.getElementById('modalImg');
  if (modal && img) {
    img.src = src;
    modal.classList.add('open');
  }
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.classList.remove('open');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
