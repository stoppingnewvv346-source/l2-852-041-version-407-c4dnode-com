(function() {
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.getElementById("site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function() {
      nav.classList.toggle("open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var redirects = document.querySelectorAll("[data-search-redirect]");
  redirects.forEach(function(form) {
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var value = input ? input.value.trim() : "";
      var target = "./search.html";
      if (value) {
        target += "?q=" + encodeURIComponent(value);
      }
      window.location.href = target;
    });
  });

  var filterForm = document.querySelector("[data-filter-form]");
  var cardList = document.querySelector("[data-card-list]");
  if (filterForm && cardList) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    var keywordInput = filterForm.querySelector("input[name='keyword']");
    if (q && keywordInput) {
      keywordInput.value = q;
    }

    var cards = Array.prototype.slice.call(cardList.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty-state]");

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(filterForm.keyword && filterForm.keyword.value);
      var region = normalize(filterForm.region && filterForm.region.value);
      var type = normalize(filterForm.type && filterForm.type.value);
      var year = normalize(filterForm.year && filterForm.year.value);
      var shown = 0;

      cards.forEach(function(card) {
        var searchable = normalize(card.getAttribute("data-search"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matched = true;

        if (keyword && searchable.indexOf(keyword) === -1) {
          matched = false;
        }
        if (region && cardRegion !== region) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }

        card.classList.toggle("hidden", !matched);
        if (matched) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", shown === 0);
      }
    }

    filterForm.addEventListener("submit", function(event) {
      event.preventDefault();
      applyFilter();
    });
    filterForm.addEventListener("input", applyFilter);
    filterForm.addEventListener("change", applyFilter);
    applyFilter();
  }
})();
