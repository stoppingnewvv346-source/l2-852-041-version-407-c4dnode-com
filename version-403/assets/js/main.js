(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function getCards() {
    return Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  }

  function setupFilters() {
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    var regionFilter = document.querySelector('[data-filter-region]');
    var typeFilter = document.querySelector('[data-filter-type]');
    var emptyState = document.querySelector('[data-empty-state]');

    function applyFilters() {
      var cards = getCards();
      if (!cards.length) {
        return;
      }

      var query = '';
      searchInputs.forEach(function (input) {
        if (document.activeElement === input || input.value) {
          query = input.value;
        }
      });

      var normalizedQuery = normalize(query);
      var region = regionFilter ? regionFilter.value : '';
      var type = typeFilter ? typeFilter.value : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type')
        ].join(' '));
        var regionMatch = !region || card.getAttribute('data-region') === region;
        var typeMatch = !type || card.getAttribute('data-type') === type;
        var queryMatch = !normalizedQuery || haystack.indexOf(normalizedQuery) !== -1;
        var show = regionMatch && typeMatch && queryMatch;
        card.classList.toggle('is-hidden', !show);
        if (show) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visibleCount === 0);
      }
    }

    searchInputs.forEach(function (input) {
      input.addEventListener('input', applyFilters);
      var form = input.closest('form');
      if (form) {
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          var target = document.querySelector('[data-card-grid]') || document.querySelector('.content-section');
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          applyFilters();
        });
      }
    });

    if (regionFilter) {
      regionFilter.addEventListener('change', applyFilters);
    }

    if (typeFilter) {
      typeFilter.addEventListener('change', applyFilters);
    }
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }

    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      if (!video || !button) {
        return;
      }

      var source = button.getAttribute('data-src') || video.getAttribute('data-video-src');
      var initialized = false;
      var hlsInstance = null;

      function attachSource() {
        if (initialized || !source) {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }

        initialized = true;
      }

      function playVideo() {
        attachSource();
        player.classList.add('is-playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      button.addEventListener('click', playVideo);
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          player.classList.remove('is-playing');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  setupFilters();
  setupHeroCarousel();
  setupPlayers();
})();
