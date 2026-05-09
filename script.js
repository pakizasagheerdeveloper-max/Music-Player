const songs = [
    { 
      title: "Pal Pal", 
      artist: "Afusic, Ali Soomro", 
      src: "Songs/Song 1.mp3", 
      duration: "2:46",
      coverArt: "Images/song1.jpg"   // peaceful nature / lake
    },
    { 
      title: "Aitbar Dendi Han", 
      artist: "S. Qadeer", 
      src: "Songs/Song 2.mp3", 
      duration: "3:52",
      coverArt: "Images/song2.jpg"    // artistic bridge
    },
    { 
      title: "Haseen", 
      artist: "Talha Anjum", 
      src: "Songs/Song 3.mp3", 
      duration: "3:48",
      coverArt: "Images/song3.jpg"   // vibrant flower
    },
    { 
      title: "Ishaq'n De Lekha", 
      artist: "Sajjan Adeeb", 
      src: "Songs/Song 4.mp3", 
      duration: "3:30",
      coverArt: "Images/song4.jpg"    // riverside trees
    },
    { 
      title: "Tere Layi", 
      artist: "Nirvair Pannu", 
      src: "Songs/Song 5.mp3", 
      duration: "6:40",
      coverArt: "Images/song5.jpg"   // urban night
    }
  ];

  // ----- DOM References -----
  const audio = new Audio();
  const playPauseBtn = document.getElementById('playPauseBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const progressBarBg = document.getElementById('progressBarBg');
  const progressFill = document.getElementById('progressFill');
  const currentTimeSpan = document.getElementById('currentTime');
  const totalDurationSpan = document.getElementById('totalDuration');
  const volumeSlider = document.getElementById('volumeControl');
  const currentSongTitleEl = document.getElementById('currentSongTitle');
  const currentArtistNameEl = document.getElementById('currentArtistName');
  const playlistContainer = document.getElementById('playlistContainer');
  const autoplayToggleDiv = document.getElementById('autoplayToggle');
  const albumArtImage = document.getElementById('albumArtImage');   // THE IMAGE ELEMENT

  // ----- State -----
  let currentTrackIndex = 0;
  let isPlaying = false;
  let autoplayEnabled = true;
  let isDraggingProgress = false;

  // Helper: format seconds to MM:SS
  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // update duration display when metadata is loaded
  function updateDurationDisplay() {
    if (audio.duration && isFinite(audio.duration)) {
      totalDurationSpan.innerText = formatTime(audio.duration);
    } else {
      totalDurationSpan.innerText = songs[currentTrackIndex].duration || "0:00";
    }
  }

  // CHANGE ALBUM ART IMAGE based on selected track
  function updateAlbumArtImage(index) {
    const track = songs[index];
    if (track && track.coverArt) {
      albumArtImage.src = track.coverArt;
      albumArtImage.alt = `${track.title} cover`;
    } else {
      // fallback image if missing
      albumArtImage.src = "https://picsum.photos/id/104/300/300";
    }
  }

  // load track: update audio source, text, and album art image
  function loadTrack(index) {
    const track = songs[index];
    if (!track) return;
    audio.src = track.src;
    audio.load();
    currentSongTitleEl.innerText = track.title;
    currentArtistNameEl.innerText = track.artist;
    // update the album art image dynamically!
    updateAlbumArtImage(index);
    totalDurationSpan.innerText = track.duration || "0:00";
    currentTimeSpan.innerText = "0:00";
    progressFill.style.width = "0%";
    if (isPlaying) {
      audio.play().catch(e => console.log("play after load need interaction"));
    }
    highlightActivePlaylistItem();
  }

  // highlight current song in playlist sidebar
  function highlightActivePlaylistItem() {
    const allItems = document.querySelectorAll('.playlist-track');
    allItems.forEach((item, idx) => {
      if (idx === currentTrackIndex) {
        item.classList.add('active-track');
      } else {
        item.classList.remove('active-track');
      }
    });
  }

  function updatePlayButtonUI() {
    playPauseBtn.innerText = isPlaying ? '⏸' : '▶';
  }

  function togglePlayPause() {
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
    } else {
      audio.play().then(() => {
        isPlaying = true;
        updatePlayButtonUI();
      }).catch(err => {
        console.warn("Playback blocked until user interaction:", err);
        isPlaying = false;
        updatePlayButtonUI();
      });
    }
    updatePlayButtonUI();
  }

  function nextTrack() {
    let nextIdx = currentTrackIndex + 1;
    if (nextIdx >= songs.length) {
      if (autoplayEnabled) {
        nextIdx = 0;   // loop to first
      } else {
        if (isPlaying) {
          audio.pause();
          isPlaying = false;
          updatePlayButtonUI();
        }
        return;
      }
    }
    changeTrack(nextIdx);
    if (isPlaying) {
      audio.play().catch(e => console.log("autoplay next"));
    }
  }

  function prevTrack() {
    let prevIdx = currentTrackIndex - 1;
    if (prevIdx < 0) prevIdx = songs.length - 1;
    changeTrack(prevIdx);
    if (isPlaying) {
      audio.play().catch(e => console.log("play prev"));
    }
  }

  function changeTrack(newIndex) {
    if (newIndex === currentTrackIndex) return;
    currentTrackIndex = newIndex;
    loadTrack(currentTrackIndex);
    if (isPlaying) {
      audio.play().catch(e => console.log("resume after change"));
    }
  }

  // update progress bar & currentTime display
  function updateProgress() {
    if (!isDraggingProgress && audio.duration && isFinite(audio.duration)) {
      const percent = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = `${percent}%`;
      currentTimeSpan.innerText = formatTime(audio.currentTime);
    } else if (!isDraggingProgress && audio.duration) {
      currentTimeSpan.innerText = formatTime(audio.currentTime);
    }
  }

  function seekTo(e) {
    const rect = progressBarBg.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    if (width > 0 && audio.duration && isFinite(audio.duration)) {
      const seekTime = (clickX / width) * audio.duration;
      audio.currentTime = seekTime;
      updateProgress();
    }
  }

  function setVolume(value) {
    audio.volume = parseFloat(value);
  }

  // build playlist with dynamic data
  function buildPlaylist() {
    playlistContainer.innerHTML = '';
    songs.forEach((song, idx) => {
      const trackDiv = document.createElement('div');
      trackDiv.classList.add('playlist-track');
      if (idx === currentTrackIndex) trackDiv.classList.add('active-track');
      trackDiv.innerHTML = `
        <div class="track-info">
          <div class="track-title">${escapeHtml(song.title)}</div>
          <div class="track-artist">${escapeHtml(song.artist)}</div>
        </div>
        <div class="track-duration">${song.duration}</div>
      `;
      trackDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentTrackIndex === idx && isPlaying) {
          // do nothing, already playing the track
        } else {
          changeTrack(idx);
          if (!isPlaying) {
            audio.play().then(() => {
              isPlaying = true;
              updatePlayButtonUI();
            }).catch(() => {
              isPlaying = false;
              updatePlayButtonUI();
            });
          }
        }
      });
      playlistContainer.appendChild(trackDiv);
    });
  }

  function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  // toggle autoplay bonus feature
  function toggleAutoplay() {
    autoplayEnabled = !autoplayEnabled;
    if (autoplayEnabled) {
      autoplayToggleDiv.classList.add('autoplay-active');
    } else {
      autoplayToggleDiv.classList.remove('autoplay-active');
    }
  }

  // When song ends -> autoplay next if enabled else stop
  function onSongEnd() {
    if (autoplayEnabled) {
      let nextIdx = currentTrackIndex + 1;
      if (nextIdx >= songs.length) {
        nextIdx = 0;
      }
      changeTrack(nextIdx);
      if (isPlaying) {
        audio.play().catch(e => console.log("autoplay after end"));
      } else {
        // Edge: if was playing, reinitiate
        audio.play().then(() => {
          isPlaying = true;
          updatePlayButtonUI();
        }).catch(() => {});
      }
    } else {
      // autoplay off: stop playback and reset UI playing state
      isPlaying = false;
      updatePlayButtonUI();
      currentTimeSpan.innerText = formatTime(audio.duration || 0);
    }
  }

  function bindAudioEvents() {
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', () => {
      updateDurationDisplay();
      if (isPlaying) {
        audio.play().catch(e=>console.log("meta play"));
      }
    });
    audio.addEventListener('ended', onSongEnd);
    audio.addEventListener('canplay', () => {
      updateDurationDisplay();
    });
    audio.addEventListener('play', () => {
      isPlaying = true;
      updatePlayButtonUI();
    });
    audio.addEventListener('pause', () => {
      isPlaying = false;
      updatePlayButtonUI();
    });
    audio.addEventListener('error', (e) => {
      console.warn("Audio loading error", e);
    });
  }

  // ----- INITIALIZATION -----
  function init() {
    buildPlaylist();
    currentTrackIndex = 0;
    loadTrack(0);
    audio.volume = 0.7;
    volumeSlider.value = "0.7";
    isPlaying = false;
    updatePlayButtonUI();
    bindAudioEvents();
    if (autoplayEnabled) autoplayToggleDiv.classList.add('autoplay-active');
    else autoplayToggleDiv.classList.remove('autoplay-active');
    
    // Event listeners
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);
    progressBarBg.addEventListener('click', seekTo);
    volumeSlider.addEventListener('input', (e) => setVolume(e.target.value));
    
    // dragging progress for smooth seek
    progressBarBg.addEventListener('mousedown', (e) => {
      isDraggingProgress = true;
      seekTo(e);
      document.addEventListener('mousemove', onMouseMoveSeek);
      document.addEventListener('mouseup', onMouseUpSeek);
    });
    
    function onMouseMoveSeek(e) {
      if (isDraggingProgress) {
        seekTo(e);
      }
    }
    function onMouseUpSeek() {
      isDraggingProgress = false;
      document.removeEventListener('mousemove', onMouseMoveSeek);
      document.removeEventListener('mouseup', onMouseUpSeek);
    }
    
    autoplayToggleDiv.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAutoplay();
    });
    
    setVolume(0.7);
  }
  
  init();