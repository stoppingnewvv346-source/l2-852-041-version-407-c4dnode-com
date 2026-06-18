function initMoviePlayer(source) {
  var video = document.querySelector('.movie-video');
  var overlay = document.querySelector('.player-overlay');
  var button = document.querySelector('.video-start');
  var loaded = false;
  var hlsInstance = null;

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({ enableWorker: true });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function playVideo() {
    attachSource();
    video.controls = true;
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var action = video.play();
    if (action && typeof action.catch === 'function') {
      action.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      playVideo();
    });
  }

  if (overlay) {
    overlay.addEventListener('click', function () {
      playVideo();
    });
  }

  video.addEventListener('click', function () {
    if (!loaded) {
      playVideo();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
