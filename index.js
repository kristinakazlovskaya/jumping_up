let submitNameBtn = document.getElementById('submit_player_name');
let nameInput = document.getElementById('modal_name_input');
let btnClickSound = new Audio();
btnClickSound.src = '/audio/click.mp3';

nameInput.addEventListener('input', function() {
  this.value = this.value.replace(/[^0-9A-Za-z]/,'');
});

submitNameBtn.addEventListener('click', () => {
  if (nameInput.value) {
    btnClickSound.play();
    openMain();
  }
});

function openMain() {
  window.location.hash = 'main';
};

function openGame() {
  window.location.hash = 'game';
};

function openHighscore() {
  window.location.hash = 'highscore';
};

function renderMainPage(data) {
  const container = document.getElementById('mainpage');
  container.style.backgroundImage = 'url("bg/startpic.png")';
  container.innerHTML = data;

  let btnPlay = document.getElementById('playBtn');
  let highscoreBtn = document.getElementById('highscoreBtn');

  btnPlay.addEventListener('click', () => {
    btnClickSound.play();
    openGame();
  });
  highscoreBtn.addEventListener('click', () => {
    btnClickSound.play();
    openHighscore();
  });
};

function renderGamePage(data) {
  const container = document.getElementById('mainpage');
  container.style.backgroundImage = 'none';
  container.innerHTML = data;
  const gameScript = document.createElement('script');
  gameScript.src = 'app.js';
  document.body.appendChild(gameScript);
};

function renderScorePage(data) {
  const container = document.getElementById('mainpage');
  container.innerHTML = data;

  let closeHighscoreBtn = document.getElementById('close_highscore_btn');
  closeHighscoreBtn.addEventListener('click', () => {
    btnClickSound.play();
    openMain();
  });
};

function updatePage() {
  let hash = window.location.hash.substr(1);

  switch (hash) {
    case "main":
      $.ajax(hash + ".html", {
          type: "GET",
          datatype: "html",
          success: renderMainPage,
      });
      break;
    case "game":
      $.ajax(hash + ".html", {
        type: "GET",
        datatype: "html",
        success: renderGamePage,
      });
      break;
    case "highscore":
      $.ajax(hash + ".html", {
        type: "GET",
        datatype: "html",
        success: renderScorePage,
      });
      break;
  }
};

window.addEventListener('hashchange', updatePage);
updatePage();