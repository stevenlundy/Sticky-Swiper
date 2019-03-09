function noop () {};

class StickySwiper {
  constructor(el, config) {
    let onDown = config.onDown || noop;
    let onMove = config.onMove || noop;
    let onUp = config.onUp || noop;
    let onCancel = config.onCancel || onUp;

    let mouseDown = false;
    let path = [];
    let touchedPoints = [];

    let stickyPoints = config.stickyPoints || [];
    let contactRadius = config.contactRadius || 10;
    let allowRevisiting = config.allowRevisiting || false;

    let getDistance = function(p1, p2) {
      return ((p1.x - p2.x)**2 + (p1.y - p2.y)**2)**0.5;
    };

    let getPointsInContact = function(point, points, contactRadius) {
      return points.filter(function(p) {
        return getDistance(p, point) < contactRadius;
      });
    };

    let getClosestPoint = function(point, points) {
      return points.reduce(function(closest, current) {
        return (getDistance(current, point) < getDistance(closest, point)) ? current : closest;
      }, points[0]);
    };

    let getMousePosition = function(e, context) {
      var x = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) - context.offsetLeft;
      var y = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) - context.offsetTop;
      e.preventDefault();
      return {x, y};
    };

    let handleNewPoint = function(point) {
      path.push(point);
      let contactPoints = getPointsInContact(point, stickyPoints, contactRadius);
      let closestPoint = getClosestPoint(point, contactPoints);
      let lastTouchedPoint = touchedPoints[touchedPoints.length-1];
      if (closestPoint && closestPoint !== lastTouchedPoint) {
        if (allowRevisiting || touchedPoints.indexOf(closestPoint) === -1) {
          touchedPoints.push(closestPoint);
        }
      }
    };

    let press = function(e) {
      let pos = getMousePosition(e, this);
      handleNewPoint(pos);
      mouseDown = true;
      onDown(el, path, touchedPoints);
    };

    let drag = function(e) {
      if (!mouseDown) { return };
      let pos = getMousePosition(e, this);
      handleNewPoint(pos);
      onMove(el, path, touchedPoints);
    };

    let release = function(e) {
      let pos = getMousePosition(e, this);
      handleNewPoint(pos);
      mouseDown = false;
      onUp(el, path, touchedPoints);
      path = [];
      touchedPoints = [];
    };

    let cancel = function(e) {
      let pos = getMousePosition(e, this);
      handleNewPoint(pos);
      mouseDown = false;
      onCancel(el, path, touchedPoints);
      path = [];
      touchedPoints = [];
    };

    // Add mouse event listeners to element
    el.addEventListener("mousedown", press, false);
    el.addEventListener("mousemove", drag, false);
    el.addEventListener("mouseup", release);
    el.addEventListener("mouseout", cancel, false);

    // Add touch event listeners to element
    el.addEventListener("touchstart", press, false);
    el.addEventListener("touchmove", drag, false);
    el.addEventListener("touchend", release, false);
    el.addEventListener("touchcancel", cancel, false);
  }
};

let path = [];
let otherPoints = [];

function drawPoint(canvas, path, touchedPoints) {
  let lastPoint = path[path.length-1];
  let context = canvas.getContext("2d");
  context.beginPath();
  context.lineWidth = 2;
  context.moveTo(path[0].x, path[0].y);
  path.forEach(function(p) {
    context.lineTo(p.x, p.y);
  });
  context.stroke();
  touchedPoints.forEach(function(p) {
    context.fillStyle = 'green';
    context.fillRect(p.x-5, p.y-5, 10, 10);
  });
}

function clearCanvas(canvas) {
  let context = canvas.getContext("2d");
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

const config = {
  onDown: drawPoint,
  onUp: clearCanvas,
  onMove: drawPoint,
  stickyPoints: [{x: 10, y: 10}, {x: 90, y: 10}, {x: 90, y: 90}, {x: 10, y: 90}]
}

new StickySwiper(myCanvas, config);
