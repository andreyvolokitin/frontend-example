import App from '../app';

App.addModule('product', () => {
  return {
    behaviors: ['product'],
  };
});
