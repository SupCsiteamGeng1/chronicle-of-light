window.Game = window.Game || {};
Game.assets = Game.assets || {};
const A = Game.assets;
function img(src){const i=new Image();i.src=src;return i;}
// Stub — full base64 images are large; replace with complete assets.js when ready
A.worldMap = img("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
A.townMap = A.worldMap;
A.battleBg = A.worldMap;
A.overworldFront = [A.worldMap];
A.overworldBack = [A.worldMap];
A.overworldSide = [A.worldMap];
A.battle = { warrior: [A.worldMap], monk: [A.worldMap], white: [A.worldMap], black: [A.worldMap] };
A.npc = { young_man: [A.worldMap], young_woman: [A.worldMap], old_man: [A.worldMap], old_woman: [A.worldMap] };
