let xDown = null;
let yDown = null;

const documentswipeleft = new CustomEvent('documentswipeleft');
const documentswiperight = new CustomEvent('documentswiperight');
const documentswipeup = new CustomEvent('documentswipeup');
const documentswipedown = new CustomEvent('documentswipedown');

function handleTouchStart(evt) {
  xDown = evt.touches[0].clientX;
  yDown = evt.touches[0].clientY;
}

function handleTouchMove(evt) {
  if (!xDown || !yDown) {
    return;
  }

  const xUp = evt.touches[0].clientX;
  const yUp = evt.touches[0].clientY;

  const xDiff = xDown - xUp;
  const yDiff = yDown - yUp;

  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    /* most significant */
    if (xDiff > 0) {
      document.dispatchEvent(documentswipeleft);
    } else {
      document.dispatchEvent(documentswiperight);
    }
  } else if (yDiff > 0) {
    document.dispatchEvent(documentswipeup);
  } else {
    document.dispatchEvent(documentswipedown);
  }

  /* reset values */
  xDown = null;
  yDown = null;
}

const swipeDetector = {
  init() {
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);
  },
  destroy() {
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
  },
};

export default swipeDetector;
