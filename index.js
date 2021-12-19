let submitNameBtn = document.getElementById('submit_player_name');
let nameInput = document.getElementById('modal_name_input');
let btnClickSound = new Audio();
btnClickSound.src = '/audio/click.mp3';
let score;

function saveInfo() {
  let results = JSON.parse(localStorage.getItem('results'));
  if (!results) {
    let resultsArr = [];
    resultsArr.push({
      name: nameInput.value,
      score: score,
    });
    localStorage.setItem('results', JSON.stringify(resultsArr));
  } else {
    let namesArr = results.map(result => result.name);
    results.forEach((result, index) => {
      if (result.name === nameInput.value && result.score < score) {
        results.splice(index, 1);
        let newResults = [...results, {
          name: nameInput.value,
          score: score,
        }];
        localStorage.setItem('results', JSON.stringify(newResults));
      } 
      else if (!namesArr.includes(nameInput.value)) {
        let newResults = [...results, {
          name: nameInput.value,
          score: score,
        }];
        localStorage.setItem('results', JSON.stringify(newResults));
      };
    });
  }
};

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

  function createHighscoreItem(name, score) {
    let highscoreItemsContainer = document.querySelector('.highscore_items_wrapper');

    let highscoreItem = document.createElement('div');
    highscoreItem.classList.add('highscore_item');

    let highscoreItemImg = document.createElement('img');
    highscoreItemImg.classList.add('highscore_item_img');
    highscoreItemImg.src = '/gui/face.png';
    highscoreItemImg.alt = 'Player image';
    highscoreItemImg.width = 70;
    highscoreItemImg.height = 70;

    let highscoreItemData = document.createElement('div');
    highscoreItemData.classList.add('highscore_item_data');

    let highscoreItemName = document.createElement('span');
    highscoreItemName.classList.add('highscore_item_name');
    highscoreItemName.innerHTML = name;
    let highscoreItemScore = document.createElement('span');
    highscoreItemScore.classList.add('highscore_item_score');
    highscoreItemScore.innerHTML = score;
    highscoreItemData.append(highscoreItemName, highscoreItemScore);

    highscoreItem.append(highscoreItemImg, highscoreItemData);
    highscoreItemsContainer.appendChild(highscoreItem);
  };

  let results = JSON.parse(localStorage.getItem('results'));
  function compare(a, b) {
    if (a.score < b.score ){
      return 1;
    };
    if ( a.score > b.score ){
      return -1;
    };
    return 0;
  };
  results.sort(compare);
  results.forEach((result, index) => {
    if (index < 6) {
      createHighscoreItem(result.name, result.score);
    }
  });

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