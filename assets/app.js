(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = form.getAttribute("action") || "./all.html";
        window.location.href = value ? target + "?q=" + encodeURIComponent(value) : target;
      });
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    document.querySelectorAll("[data-local-search]").forEach(function (input) {
      input.value = q;
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;
      var show = function (index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      };
      var restart = function () {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      };
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          restart();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });
      show(0);
      restart();
    }

    var panels = document.querySelectorAll("[data-filter-panel]");
    panels.forEach(function (panel) {
      var root = panel.parentElement;
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
      var searchInput = panel.querySelector("[data-local-search]");
      var currentCategory = "";
      var currentRegion = "";
      var currentYear = "";

      var apply = function () {
        var term = normalize(searchInput ? searchInput.value : "");
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var category = normalize(card.getAttribute("data-category"));
          var region = normalize(card.getAttribute("data-region"));
          var year = normalize(card.getAttribute("data-year"));
          var visible = true;
          if (term && text.indexOf(term) === -1) {
            visible = false;
          }
          if (currentCategory && category !== currentCategory) {
            visible = false;
          }
          if (currentRegion && region !== currentRegion) {
            visible = false;
          }
          if (currentYear && year !== currentYear) {
            visible = false;
          }
          card.classList.toggle("is-hidden", !visible);
        });
      };

      if (searchInput) {
        searchInput.addEventListener("input", apply);
      }

      panel.querySelectorAll("[data-filter-category]").forEach(function (button) {
        button.addEventListener("click", function () {
          currentCategory = normalize(button.getAttribute("data-filter-category"));
          panel.querySelectorAll("[data-filter-category]").forEach(function (item) {
            item.classList.remove("active");
          });
          panel.querySelectorAll("[data-filter-region], [data-filter-year]").forEach(function (item) {
            item.classList.remove("active");
          });
          button.classList.add("active");
          currentRegion = "";
          currentYear = "";
          apply();
        });
      });

      panel.querySelectorAll("[data-filter-region]").forEach(function (button) {
        button.addEventListener("click", function () {
          currentRegion = normalize(button.getAttribute("data-filter-region"));
          panel.querySelectorAll("[data-filter-region]").forEach(function (item) {
            item.classList.remove("active");
          });
          button.classList.add("active");
          apply();
        });
      });

      panel.querySelectorAll("[data-filter-year]").forEach(function (button) {
        button.addEventListener("click", function () {
          currentYear = normalize(button.getAttribute("data-filter-year"));
          panel.querySelectorAll("[data-filter-year]").forEach(function (item) {
            item.classList.remove("active");
          });
          button.classList.add("active");
          apply();
        });
      });

      var all = panel.querySelector("[data-filter-all]");
      if (all) {
        all.addEventListener("click", function () {
          currentCategory = "";
          currentRegion = "";
          currentYear = "";
          panel.querySelectorAll("button").forEach(function (item) {
            item.classList.remove("active");
          });
          all.classList.add("active");
          apply();
        });
      }

      apply();
    });
  });
})();
