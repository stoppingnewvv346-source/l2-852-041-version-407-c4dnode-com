(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer = null;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function startCarousel() {
    if (slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      setSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = Number(dot.getAttribute('data-hero-dot'));
      window.clearInterval(timer);
      setSlide(index);
      startCarousel();
    });
  });

  setSlide(0);
  startCarousel();

  var input = document.getElementById('searchInput');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.js-search-card'));
  var empty = document.getElementById('emptyState');

  function filterCards() {
    if (!input || !cards.length) {
      return;
    }

    var query = input.value.trim().toLowerCase();
    var visible = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-text') || card.textContent || '').toLowerCase();
      var matched = !query || text.indexOf(query) !== -1;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  if (input) {
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get('q');

    if (keyword) {
      input.value = keyword;
    }

    input.addEventListener('input', filterCards);
    filterCards();
  }
})();
