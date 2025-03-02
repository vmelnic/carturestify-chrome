function initializePlaylist() {
  const playlist = document.createElement("div");
  playlist.id = "carturestify-playlist";
  playlist.style.position = "fixed";
  playlist.style.bottom = "0";
  playlist.style.right = "0";
  playlist.style.width = "400px";
  playlist.style.height = "40px";
  playlist.style.background = "#202020";
  playlist.style.border = "1px solid #000";
  playlist.style.zIndex = "9999";
  playlist.style.overflow = "hidden";

  const toolbar = document.createElement("div");
  toolbar.style.width = "100%";
  toolbar.style.height = "40px";
  toolbar.style.display = "flex";
  toolbar.style.justifyContent = "space-between";
  toolbar.style.alignItems = "center";
  toolbar.style.background = "#000";
  toolbar.style.color = "#c8c6c6";
  toolbar.style.padding = "0 10px";
  toolbar.innerHTML = `<span>🎵 Carturestzy by ALBUMZY</span><button id="toggle-playlist" style="background: black; color: white; border: none; padding: 5px 10px; cursor: pointer;">➕</button>`;
  playlist.appendChild(toolbar);

  const playlistContent = document.createElement("div");
  playlistContent.id = "playlist-content";
  playlistContent.style.height = "0";
  playlistContent.style.padding = "4px";
  playlistContent.style.overflow = "auto";
  playlist.appendChild(playlistContent);

  const spinner = document.createElement("div");
  spinner.id = "playlist-spinner";
  spinner.style.display = "none";
  spinner.style.position = "absolute";
  spinner.style.top = "50%";
  spinner.style.left = "50%";
  spinner.style.transform = "translate(-50%, -50%)";
  spinner.style.border = "4px solid #f3f3f3";
  spinner.style.borderTop = "4px solid #3498db";
  spinner.style.borderRadius = "50%";
  spinner.style.width = "20px";
  spinner.style.height = "20px";
  spinner.style.animation = "spin 1s linear infinite";
  playlist.appendChild(spinner);

  document.body.appendChild(playlist);

  createInfoMessage()

  document.getElementById("toggle-playlist").addEventListener("click", togglePlaylist);
}

function maximizePlaylist() {
  const playlist = document.getElementById("carturestify-playlist");
  const content = document.getElementById("playlist-content");
  const btn = document.getElementById("toggle-playlist");

  playlist.style.height = "450px";
  content.style.height = "calc(100% - 40px)";
  content.style.padding = "4px";
  btn.textContent = "➖";
}

function togglePlaylist() {
  const playlist = document.getElementById("carturestify-playlist");
  const content = document.getElementById("playlist-content");
  const btn = document.getElementById("toggle-playlist");

  if (content.style.height === "0px" || content.style.height === "0") {
    maximizePlaylist()
  } else {
    playlist.style.height = "40px";
    content.style.height = "0";
    content.style.padding = "0";
    btn.textContent = "➕";
  }
}

function addPlayButtons() {
  const cards = document.querySelectorAll('.cartu-grid-tile');
  cards.forEach((card) => {
    const imgContainer = card.querySelector('.productImageContainer');
    if (!imgContainer) return;

    if (card.querySelector('.carturestify-play-button')) {
      return;
    }

    const playButton = document.createElement("button");
    playButton.className = 'carturestify-play-button';
    playButton.textContent = "🎵";
    playButton.style.position = "absolute";
    playButton.style.top = "50%";
    playButton.style.left = "50%";
    playButton.style.transform = "translate(-50%, -50%)";
    playButton.style.background = "rgba(255,0,145,0.4)";
    playButton.style.color = "#fff";
    playButton.style.border = "none";
    playButton.style.padding = "10px";
    playButton.style.borderRadius = "50%";
    playButton.style.cursor = "pointer";
    playButton.style.fontSize = "20px";
    playButton.style.lineHeight = "1";

    playButton.addEventListener("click", (event) => {
      event.preventDefault()
      handlePlayClick(card);
    });

    imgContainer.style.position = "relative";
    imgContainer.appendChild(playButton);
  });
}

function handlePlayClick(card) {
  const artistElement = card.querySelector('.subtitlu-produs a');
  const titleElement = card.querySelector('.md-title');

  if (artistElement && titleElement) {
    const artistName = artistElement.textContent;
    let albumName = titleElement.textContent;
    // filter
    albumName = albumName
    .replace(/[(\-].*$/, '')
    .replace(/\b\d+\s*(Vinyl|Vinyls)\b/i, '')
    .replace(/\b(Vinyl|Vinyls)\b/i, '')
    .trim();

    searchAndDisplayAlbum(artistName, albumName);
    maximizePlaylist();
  }
}

function createInfoMessage() {
  const content = document.getElementById("playlist-content");
  const infoMessage = document.createElement("div");
  infoMessage.id = "info-message";
  infoMessage.style.display = "flex";
  infoMessage.style.justifyContent = "center";
  infoMessage.style.alignItems = "center";
  infoMessage.style.height = "100%";
  infoMessage.style.color = "#f3f3f3";
  infoMessage.textContent = "Press on the album card to start the search.";
  content.appendChild(infoMessage);
}

function clearInfoMessage() {
  const infoMessage = document.getElementById("info-message");
  if (infoMessage) {
    infoMessage.style.display = "none";
  }
}

function clearPlaylistContent() {
  const playlistContent = document.getElementById("playlist-content");
  while (playlistContent.firstChild) {
    playlistContent.removeChild(playlistContent.firstChild);
  }
}

function toggleSpinnerDisplay(display) {
  document.getElementById("playlist-spinner").style.display = display;
}

function searchAndDisplayAlbum(artist, album) {
  const playlistContent = document.getElementById("playlist-content");
  clearInfoMessage()

  chrome.storage.local.get("ALBUMZY_TOKEN", (data) => {
    const token = data["ALBUMZY_TOKEN"];
    if (!token) {
      alert("Please log in through the popup to search for albums.");
      return;
    }

    toggleSpinnerDisplay('block')

    const search = (artist !== album) ? `${artist} ${album}` : artist;
    console.log(">>> search for:", search)
    fetch("https://albumzy.com/api/spotify/search", {
      method : "POST",
      body   : JSON.stringify({search, limit: 3}),
      headers: {
        "Content-Type": "application/json",
        "X-AUTH-TOKEN": token
      },
    }).then((response) => {
      return response.json();
    }).then((data) => {
      toggleSpinnerDisplay('none')

      if (data.albums && data.albums.length > 0) {
        clearPlaylistContent();

        data.albums.forEach((album) => {
          const albumFrame = document.createElement('div');
          albumFrame.className = "playlist-content-item";
          albumFrame.innerHTML = album.iframe;
          playlistContent.appendChild(albumFrame);
        });
      }
    }).catch(error => {
      document.getElementById("playlist-spinner").style.display = "none";
      console.error("Error fetching album data:", error);
      alert("There was an error fetching the album data.");
    });
  });
}

function init() {
  chrome.storage.local.get("ALBUMZY_TOKEN", (data) => {
    const token = data["ALBUMZY_TOKEN"];
    if (!token) {
      confirm("Carturestify. Please log in through the popup to search for albums.")
      return;
    }
    initializePlaylist();
    addPlayButtons();
  })

  const observer = new MutationObserver(() => {
    addPlayButtons();
  });

  const targetNode = document.querySelector('.cartu-grid-list');
  if (targetNode) {
    observer.observe(targetNode, {childList: true, subtree: true});
    addPlayButtons();
  }
}

chrome.runtime.onMessage.addListener(
  function (request) {
    if (request.message === "onLoginComplete") {
      init();
    }
  }
);

setTimeout(() => {
  init()
}, 3000)
