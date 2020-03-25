import App from '../app';
import '../behaviors/modal';

App.addModule('modal', () => {
  return {
    behaviors: ['modal'],
  };
});
