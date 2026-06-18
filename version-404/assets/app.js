(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function setSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                setSlide(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                setSlide(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                setSlide(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                setSlide(current + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        setSlide(0);
        start();
    }

    function initHeroSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-site-search-form]"));

        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();

                var input = form.querySelector("input");
                var query = input ? input.value.trim() : "";
                var url = "./search.html";

                if (query) {
                    url += "?q=" + encodeURIComponent(query);
                }

                window.location.href = url;
            });
        });
    }

    function initFilters() {
        var filterRoot = document.querySelector("[data-filter-root]");

        if (!filterRoot) {
            return;
        }

        var input = filterRoot.querySelector("[data-filter-input]");
        var category = filterRoot.querySelector("[data-filter-category]");
        var year = filterRoot.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(filterRoot.querySelectorAll("[data-movie-card]"));
        var empty = filterRoot.querySelector("[data-filter-empty]");

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");

        if (initialQuery && input) {
            input.value = initialQuery;
        }

        function applyFilters() {
            var query = normalize(input ? input.value : "");
            var categoryValue = normalize(category ? category.value : "");
            var yearValue = normalize(year ? year.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-region")
                ].join(" "));
                var cardCategory = normalize(card.getAttribute("data-category"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var matched = true;

                if (query && haystack.indexOf(query) === -1) {
                    matched = false;
                }

                if (categoryValue && cardCategory !== categoryValue) {
                    matched = false;
                }

                if (yearValue && cardYear !== yearValue) {
                    matched = false;
                }

                card.classList.toggle("is-hidden", !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [input, category, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        applyFilters();
    }

    window.setupMoviePlayer = function (source, videoId, overlayId) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var hlsInstance = null;
        var loaded = false;

        if (!video || !source) {
            return;
        }

        function load() {
            if (loaded) {
                return;
            }

            loaded = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                video.src = source;
            }
        }

        function play() {
            load();
            video.controls = true;

            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            var promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initHeroSearch();
        initFilters();
    });
})();
