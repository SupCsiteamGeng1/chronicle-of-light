window.Game = window.Game || {};
const S = Game.state;
const api = Game.api;

function hide(id) { document.getElementById(id).classList.add("hidden"); }
function show(id) { document.getElementById(id).classList.remove("hidden"); }

api.ui = {
  hideTitle() { hide("title"); },
  closeCity() { hide("cityToast"); S.mode = "world"; },
  closeTalk() { api.closeTalk(); },
  showOverlay() { document.getElementById("overlay").classList.add("show"); },
  hideOverlay() { document.getElementById("overlay").classList.remove("show"); }
};
