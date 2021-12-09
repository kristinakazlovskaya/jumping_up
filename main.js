const btnPlay = document.getElementById('play');

document.addEventListener('click', openGame);

function openGame() {
  window.location.hash = "game";
};

// function renderGamePage(data) {
//   const container = document.getElementById('mainpage');
//   container.innerHTML = data;
// };

function updatePage() {
  let prom = fetch('game.html', {method: 'get'})
  .then(data => {
    const container = document.getElementById('mainpage');
    container.innerHTML = data;
  })
  .catch(err => console.log(err));
};

window.onhashchange = updatePage;