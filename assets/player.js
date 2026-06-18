(function () {
  window.initMoviePlayer = function (streamUrl) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    if (!video || !streamUrl) {
      return;
    }
    var attached = false;
    var hlsObject = null;

    function attachStream() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsObject = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsObject.loadSource(streamUrl);
        hlsObject.attachMedia(video);
        return;
      }
      video.src = streamUrl;
    }

    function play() {
      attachStream();
      video.controls = true;
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsObject) {
        hlsObject.destroy();
      }
    });
  };
})();
