function noop () {};

class StickySwiper {
  constructor(el, config) {
    let onDown = config.onDown || noop;
    let onMove = config.onMove || noop;
    let onUp = config.onUp || noop;
    let onCancel = config.onCancel || onUp;

    let mouseDown = false;

    let getMousePosition = function(e, context) {
      var x = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) - context.offsetLeft;
      var y = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) - context.offsetTop;
      e.preventDefault();
      return {x, y};
    }

    let press = function(e) {
      let {x, y} = getMousePosition(e, this);
      mouseDown = true;
      onDown(el, x, y);
    };

    let drag = function(e) {
      if (!mouseDown) { return };
      let {x, y} = getMousePosition(e, this);
      onMove(el, x, y);
    };

    let release = function(e) {
      let {x, y} = getMousePosition(e, this);
      mouseDown = false;
      onUp(el, x, y);
    };

    let cancel = function(e) {
      let {x, y} = getMousePosition(e, this);
      mouseDown = false;
      onCancel(el, x, y);
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

function drawPoint(canvas, x, y) {
  let context = canvas.getContext("2d");
  context.strokeRect(x, y, 1, 1);
}

function clearCanvas(canvas) {
  let context = canvas.getContext("2d");
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

const config = {
  onDown: drawPoint,
  onUp: clearCanvas,
  onMove: drawPoint
}

new StickySwiper(myCanvas, config);
