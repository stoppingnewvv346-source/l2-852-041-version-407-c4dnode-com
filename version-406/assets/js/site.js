(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navButton && mobileNav) {
    navButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var active = 0;
  var timer;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === active);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === active);
    });
  }

  function startTimer() {
    if (slides.length < 2) {
      return;
    }
    clearInterval(timer);
    timer = setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  if (slides.length) {
    showSlide(0);
    startTimer();
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        startTimer();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        startTimer();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyFilters(panel) {
    var input = panel.querySelector('[data-filter-input]');
    var category = panel.querySelector('[data-filter-category]');
    var year = panel.querySelector('[data-filter-year]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var empty = document.querySelector('[data-filter-empty]');
    var q = normalize(input && input.value);
    var c = normalize(category && category.value);
    var y = normalize(year && year.value);
    var r = normalize(region && region.value);
    var t = normalize(type && type.value);
    var visible = 0;

    cards.forEach(function (card) {
      var search = normalize(card.getAttribute('data-search'));
      var cardCategory = normalize(card.getAttribute('data-category'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var cardType = normalize(card.getAttribute('data-type'));
      var matched = true;

      if (q && search.indexOf(q) === -1) {
        matched = false;
      }
      if (c && cardCategory !== c) {
        matched = false;
      }
      if (y && cardYear !== y) {
        matched = false;
      }
      if (r && cardRegion !== r) {
        matched = false;
      }
      if (t && cardType !== t) {
        matched = false;
      }

      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    var controls = Array.prototype.slice.call(panel.querySelectorAll('input, select'));
    var input = panel.querySelector('[data-filter-input]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && input) {
      input.value = q;
    }

    controls.forEach(function (control) {
      control.addEventListener('input', function () {
        applyFilters(panel);
      });
      control.addEventListener('change', function () {
        applyFilters(panel);
      });
    });

    applyFilters(panel);
  });
})();
