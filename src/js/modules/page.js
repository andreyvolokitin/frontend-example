import App from '../app';
import '../behaviors/page';

App.addModule('page', () => {
  return {
    behaviors: ['page'],
  };
});
