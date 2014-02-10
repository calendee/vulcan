/** @jsx React.DOM */
var Wrapper = require('./components/container');

var initialize = function (options) {

  options = options || {};

  var container = document.createElement('div');
      container.id = 'forge-stealth';

  document.body.appendChild(container);

  React.renderComponent(<Wrapper options={options} />, container);

};

// Check to see if the app is running in the devtools
if (chrome && chrome.devtools) {
  // If it is, let the devtools initialize the app
  window.VULCAN = initialize;
}
else {
  document.addEventListener('DOMContentLoaded', initialize);
}