document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    // document ready
    pangu.spacingElementById('main');

    document.addEventListener('DOMContentLoaded', () => {
      // listen to any DOM change and automatically perform spacing via MutationObserver()
      pangu.autoSpacingPage();
    });
  }
};
