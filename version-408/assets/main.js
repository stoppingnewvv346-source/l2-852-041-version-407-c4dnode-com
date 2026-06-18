(function() {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        show(current + 1);
      }, 5600);
    }
  }

  const filterInput = document.querySelector('[data-filter-input]');
  const filterYear = document.querySelector('[data-filter-year]');
  const cards = Array.from(document.querySelectorAll('[data-card]'));

  function applyFilter() {
    const keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    const year = filterYear ? filterYear.value : '';

    cards.forEach(function(card) {
      const text = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-year') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();
      const yearMatch = !year || (card.getAttribute('data-year') || '').indexOf(year) !== -1;
      const keywordMatch = !keyword || text.indexOf(keyword) !== -1;
      card.classList.toggle('is-filter-hidden', !(yearMatch && keywordMatch));
    });
  }

  if (filterInput) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      filterInput.value = q;
    }
    filterInput.addEventListener('input', applyFilter);
  }

  if (filterYear) {
    filterYear.addEventListener('change', applyFilter);
  }

  if (filterInput || filterYear) {
    applyFilter();
  }
})();
