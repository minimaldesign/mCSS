// DIALOG
const dialog = document.querySelector("dialog");
const showButton = document.querySelector("dialog + button");
const closeButton = document.querySelector("dialog button");

// "Show the dialog" button opens the dialog modally
showButton.addEventListener("click", () => {
  dialog.classList.add("body-is-locked");
  dialog.showModal();
});

// "Close" button closes the dialog
closeButton.addEventListener("click", () => {
  dialog.classList.remove("body-is-locked");
  dialog.close();
});

// CANVAS ANIMATION
var canvas = document.querySelector(".docs_canvas"),
  ctx = canvas.getContext("2d"),
  particles = [],
  particlesNum = 150,
  w = 384,
  h = 250,
  colors = ["#bae6fd", "#38bdf8", "#0284c7", "#075985", "#f9a007"];

canvas.width = w;
canvas.height = h;
canvas.style.left = (window.innerWidth - w) / 2 + "px";

if (window.innerHeight > h)
  canvas.style.top = (window.innerHeight - h) / 2 + "px";

function Factory() {
  this.x = Math.round(Math.random() * w);
  this.y = Math.round(Math.random() * h);
  this.rad = Math.round(Math.random() * 1) + 1;
  this.rgba = colors[Math.round(Math.random() * 3)];
  this.vx = Math.round(Math.random() * 3) - 1.5;
  this.vy = Math.round(Math.random() * 3) - 1.5;
}

function draw() {
  ctx.clearRect(0, 0, w, h);
  ctx.globalCompositeOperation = "lighter";
  for (var i = 0; i < particlesNum; i++) {
    var temp = particles[i];
    var factor = 1;

    for (var j = 0; j < particlesNum; j++) {
      var temp2 = particles[j];
      ctx.linewidth = 0.5;

      if (temp.rgba == temp2.rgba && findDistance(temp, temp2) < 50) {
        ctx.strokeStyle = temp.rgba;
        ctx.beginPath();
        ctx.moveTo(temp.x, temp.y);
        ctx.lineTo(temp2.x, temp2.y);
        ctx.stroke();
        factor++;
      }
    }

    ctx.fillStyle = temp.rgba;
    ctx.strokeStyle = temp.rgba;

    ctx.beginPath();
    ctx.arc(temp.x, temp.y, temp.rad * factor, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(temp.x, temp.y, (temp.rad + 2) * factor, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.closePath();

    temp.x += temp.vx;
    temp.y += temp.vy;

    if (temp.x > w) temp.x = 0;
    if (temp.x < 0) temp.x = w;
    if (temp.y > h) temp.y = 0;
    if (temp.y < 0) temp.y = h;
  }
}

function findDistance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

window.requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

(function init() {
  for (var i = 0; i < particlesNum; i++) {
    particles.push(new Factory());
  }
})();

(function loop() {
  draw();
  requestAnimFrame(loop);
})();
