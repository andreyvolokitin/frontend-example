function isElementInViewport(el) {
  let element = el;

  // special bonus for those using jQuery
  if (typeof jQuery === 'function' && el instanceof jQuery) {
    // eslint-disable-next-line prefer-destructuring
    element = el[0];
  }

  const rect = element.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) /* or $(window).height() */ &&
    rect.right <=
      (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
  );
}

export default isElementInViewport;
