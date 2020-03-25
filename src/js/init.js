import App from './app';
import config from './globalConfig';

// a hack for development mode: wait for `style-loader` to apply page styles before initializing
function init() {
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => App.init(config), 50);
  } else {
    App.init(config);
  }
}

export default init;
