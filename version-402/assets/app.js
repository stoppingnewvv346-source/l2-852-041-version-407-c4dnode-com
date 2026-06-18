(function () {
  var activeHeroTimer = null;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupBackTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }
    window.addEventListener("scroll", function () {
      button.classList.toggle("is-visible", window.scrollY > 360);
    });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    function restart() {
      window.clearInterval(activeHeroTimer);
      activeHeroTimer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    restart();
  }

  function setupPageFilter() {
    var input = document.querySelector("[data-page-filter]");
    var genre = document.querySelector("[data-genre-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!cards.length || (!input && !genre)) {
      return;
    }
    function filterCards() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var selectedGenre = genre ? genre.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-tags") || "",
          card.getAttribute("data-genre") || "",
          card.getAttribute("data-year") || ""
        ].join(" ").toLowerCase();
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchGenre = !selectedGenre || haystack.indexOf(selectedGenre) !== -1;
        card.classList.toggle("is-hidden", !(matchKeyword && matchGenre));
      });
    }
    if (input) {
      input.addEventListener("input", filterCards);
    }
    if (genre) {
      genre.addEventListener("change", filterCards);
    }
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-play-button]");
      var stream = shell.getAttribute("data-stream");
      var loaded = false;
      var hls = null;
      if (!video || !button || !stream) {
        return;
      }
      function loadStream() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.load();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return;
        }
        video.src = stream;
        video.load();
      }
      function playVideo() {
        button.hidden = true;
        loadStream();
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            button.hidden = false;
          });
        }
      }
      button.addEventListener("click", playVideo);
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener("play", function () {
        button.hidden = true;
      });
      video.addEventListener("ended", function () {
        button.hidden = false;
      });
      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }

  function getQuery(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function createSearchCard(movie) {
    return [
      '<a class="movie-card toffee-card hover-lift" href="./' + movie.url + '">',
      '  <figure>',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="duration-pill">' + escapeHtml(movie.duration) + '</span>',
      '  </figure>',
      '  <div class="movie-card-body">',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="card-meta"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
      '  </div>',
      '</a>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  function setupSearchPage() {
    var results = document.getElementById("search-results");
    if (!results || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var input = document.querySelector("[data-search-input]");
    var category = document.querySelector("[data-search-category]");
    var year = document.querySelector("[data-search-year]");
    var form = document.querySelector("[data-search-form]");
    var query = getQuery("q");
    if (input) {
      input.value = query;
    }
    function render() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var selectedCategory = category ? category.value : "";
      var selectedYear = year ? year.value : "";
      var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var haystack = [movie.title, movie.oneLine, movie.genre, movie.region, movie.type, movie.category, movie.tags.join(" "), movie.year].join(" ").toLowerCase();
        return (!keyword || haystack.indexOf(keyword) !== -1) &&
          (!selectedCategory || movie.category === selectedCategory) &&
          (!selectedYear || String(movie.year).indexOf(selectedYear) !== -1);
      }).slice(0, 120);
      if (!matched.length) {
        results.innerHTML = '<div class="empty-state toffee-card">没有找到匹配影片</div>';
        return;
      }
      results.innerHTML = matched.map(createSearchCard).join("");
    }
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        render();
      });
    }
    if (input) {
      input.addEventListener("input", render);
    }
    if (category) {
      category.addEventListener("change", render);
    }
    if (year) {
      year.addEventListener("change", render);
    }
    render();
  }

  ready(function () {
    setupMenu();
    setupBackTop();
    setupHero();
    setupPageFilter();
    setupPlayers();
    setupSearchPage();
  });
})();
