const btnPlay = document.getElementById('play');

document.addEventListener('click', openGame);

function openGame() {
  window.location.hash = "game";
};

function renderGamePage(data) {
  const container = document.getElementById('mainpage');
  container.innerHTML = data;
  const gameScript = document.createElement('script');
  gameScript.src = 'app.js';
  document.body.appendChild(gameScript);
};

function showError(data) {
  console.log('error' + data);
}

function updatePage() {
  $.ajax('game.html', {
      type: "GET",
      dataType: "html",
      success: renderGamePage,
      error: showError
  })
};

window.onhashchange = updatePage;