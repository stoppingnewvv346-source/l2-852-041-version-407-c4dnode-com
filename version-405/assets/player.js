
(function () {
  var sourceNode = document.getElementById('stream-source');
  var video = document.querySelector('.movie-video');
  var button = document.querySelector('[data-play-button]');
  var shell = document.querySelector('[data-player-shell]');
  var stream = sourceNode ? sourceNode.textContent.trim() : '';
  var hls = null;
  var loaded = false;

  function attachStream() {
    if (!video || !stream || loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      return;
    }

    video.src = stream;
  }

  function playVideo() {
    attachStream();

    if (button) {
      button.classList.add('is-hidden');
    }

    if (video) {
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      playVideo();
    });
  }

  if (shell) {
    shell.addEventListener('click', function (event) {
      if (event.target === video && video && video.paused) {
        playVideo();
      }
    });
  }

  if (video) {
    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('emptied', function () {
      if (hls) {
        hls.destroy();
        hls = null;
        loaded = false;
      }
    });
  }
})();
