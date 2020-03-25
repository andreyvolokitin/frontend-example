import App from '../app';
import '../behaviors/search';

App.addModule('search', () => {
  return {
    behaviors: ['search'],
  };
});
