(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileNavigation() {
        var toggle = qs('[data-mobile-toggle]');
        var links = qs('[data-nav-links]');
        var search = qs('.nav-search');

        if (!toggle || !links || !search) {
            return;
        }

        toggle.addEventListener('click', function () {
            links.classList.toggle('is-open');
            search.classList.toggle('is-open');
        });
    }

    function initHeroSlider() {
        var slides = qsa('[data-hero-slide]');
        var dots = qsa('[data-hero-dot]');
        var current = 0;

        if (slides.length <= 1) {
            return;
        }

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        window.setInterval(function () {
            show(current + 1);
        }, 5600);
    }

    function initPageFilters() {
        var textInput = qs('[data-page-filter]');
        var categorySelect = qs('[data-category-filter]');
        var typeSelect = qs('[data-filter-select]');
        var cards = qsa('[data-movie-card]');
        var emptyTip = qs('[data-empty-tip]');

        if (!cards.length || (!textInput && !categorySelect && !typeSelect)) {
            return;
        }

        function apply() {
            var keyword = textInput ? textInput.value.trim().toLowerCase() : '';
            var category = categorySelect ? categorySelect.value : '';
            var typeValue = typeSelect ? typeSelect.value.trim().toLowerCase() : '';
            var visible = 0;

            cards.forEach(function (card) {
                var searchText = (card.getAttribute('data-search-text') || '').toLowerCase();
                var cardCategory = card.getAttribute('data-category') || '';
                var matchesKeyword = !keyword || searchText.indexOf(keyword) !== -1;
                var matchesCategory = !category || cardCategory === category;
                var matchesType = !typeValue || searchText.indexOf(typeValue) !== -1;
                var shouldShow = matchesKeyword && matchesCategory && matchesType;

                card.hidden = !shouldShow;
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (emptyTip) {
                emptyTip.hidden = visible !== 0;
            }
        }

        [textInput, categorySelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    }

    function initSearchPage() {
        var results = qs('[data-search-results]');
        var form = qs('[data-search-form]');
        var input = qs('[data-search-input]');
        var categorySelect = qs('[data-search-category]');
        var typeSelect = qs('[data-search-type]');
        var summary = qs('[data-search-summary]');

        if (!results || !window.MOVIES_DATA) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        if (input && params.get('q')) {
            input.value = params.get('q');
        }

        function movieCard(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return [
                '<article class="movie-card">',
                '    <a class="movie-poster" href="movie/' + movie.id + '.html" aria-label="观看' + escapeHtml(movie.title) + '">',
                '        <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '        <span class="poster-badge">' + escapeHtml(movie.score) + '</span>',
                '    </a>',
                '    <div class="movie-body">',
                '        <div class="movie-meta-line">',
                '            <span>' + escapeHtml(movie.year) + '</span>',
                '            <span>' + escapeHtml(movie.region) + '</span>',
                '            <span>' + escapeHtml(movie.type) + '</span>',
                '        </div>',
                '        <h3><a href="movie/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>',
                '        <p>' + escapeHtml(movie.one_line) + '</p>',
                '        <div class="tag-row">' + tags + '</div>',
                '    </div>',
                '</article>'
            ].join('\n');
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function applySearch(event) {
            if (event) {
                event.preventDefault();
            }

            var keyword = input ? input.value.trim().toLowerCase() : '';
            var category = categorySelect ? categorySelect.value : '';
            var typeValue = typeSelect ? typeSelect.value : '';
            var matched = window.MOVIES_DATA.filter(function (movie) {
                var text = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.category_name,
                    movie.one_line,
                    (movie.tags || []).join(' ')
                ].join(' ').toLowerCase();

                return (!keyword || text.indexOf(keyword) !== -1)
                    && (!category || movie.category_slug === category)
                    && (!typeValue || movie.type.indexOf(typeValue) !== -1);
            });

            var limited = matched.slice(0, 120);
            results.innerHTML = limited.map(movieCard).join('\n');

            if (summary) {
                summary.textContent = '共匹配 ' + matched.length + ' 部影片，当前显示前 ' + limited.length + ' 部。';
            }
        }

        if (form) {
            form.addEventListener('submit', applySearch);
        }

        [input, categorySelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applySearch);
                control.addEventListener('change', applySearch);
            }
        });

        applySearch();
    }

    function initPlayers() {
        qsa('[data-player]').forEach(function (shell) {
            var video = qs('video', shell);
            var trigger = qs('[data-player-trigger]', shell);
            var message = qs('[data-player-message]', shell);
            var source = shell.getAttribute('data-video-url');
            var hlsInstance = null;

            if (!video || !trigger || !source) {
                return;
            }

            function setMessage(text) {
                if (message) {
                    message.textContent = text || '';
                }
            }

            function playVideo() {
                setMessage('正在加载播放源...');
                shell.classList.add('is-playing');

                if (window.Hls && window.Hls.isSupported()) {
                    if (hlsInstance) {
                        hlsInstance.destroy();
                    }

                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });

                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().then(function () {
                            setMessage('');
                        }).catch(function () {
                            setMessage('浏览器阻止了自动播放，请再次点击播放器。');
                        });
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage('播放源加载失败，请刷新页面后重试。');
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', function () {
                        video.play().then(function () {
                            setMessage('');
                        }).catch(function () {
                            setMessage('浏览器阻止了自动播放，请再次点击播放器。');
                        });
                    }, { once: true });
                } else {
                    setMessage('当前浏览器不支持 HLS 播放，请使用新版 Chrome、Edge、Safari 或 Firefox。');
                }
            }

            trigger.addEventListener('click', playVideo);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNavigation();
        initHeroSlider();
        initPageFilters();
        initSearchPage();
        initPlayers();
    });
}());
