import { Spinner } from 'spin.js';
import 'spin.js/spin.css';

/* https://spin.js.org/#usage */
const options = {
  lines: 10, // The number of lines to draw
  length: 5, // The length of each line
  width: 2, // The line thickness
  radius: 5, // The radius of the inner circle
  corners: 1, // Corner roundness (0..1)
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#333', // #rgb or #rrggbb or array of colors
  speed: 1.5, // Rounds per second
  trail: 64, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: true, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: false, // Top position relative to parent in px
  left: false, // Left position relative to parent in px
};

export default Spinner;
export { options };
