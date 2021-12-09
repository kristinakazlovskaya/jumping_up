let btnPlay = document.querySelector('#playBtn');

let gameJSIsLoaded = false;

btnPlay.addEventListener('click', openGame);

function openGame() {
  window.location.hash = "game";
};

function renderGamePage(data) {
  const container = document.getElementById('mainpage');
  container.innerHTML = data;
  if (!gameJSIsLoaded) {
  const gameScript = document.createElement('script');
  gameScript.src = 'app.js';
  document.body.appendChild(gameScript);
  gameJSIsLoaded = true;
  }
};

function renderIndexPage(data) {
  const container = document.getElementById('mainpage');
  container.innerHTML = data;
};

function updatePage() {
  let hash = window.location.hash.substr(1);

  switch (hash) {
    // case "":
    //   $.ajax("index.html", {
    //       type: "GET",
    //       datatype: "html",
    //       success: renderIndexPage,
    //   });
    //   break;
    // case "index":
    //   $.ajax(hash + ".html", {
    //       type: "GET",
    //       datatype: "html",
    //       success: renderIndexPage,
    //   });
    //   break;
    case "game":
      $.ajax(hash + ".html", {
          type: "GET",
          datatype: "html",
          success: renderGamePage,
      });
      break;
  }
};

//window.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('hashchange', updatePage);
  updatePage();
//});

//rewrite with Fetch