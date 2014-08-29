/** @jsx React.DOM */

/*
* Import React Components
*/
var React = require('react/addons');
window.React = React;
var Wrapper = require('./components/container');

var initialize = function (options) {
  options = options || {};

  //Create Container for React Module
  var container = document.createElement('div');
  container.id = 'vulcan';
  document.body.appendChild(container);

  // Add React component
  React.renderComponent(<Wrapper options={options} />, container);
};


/*
* Init with chrome dev tools or browser window
*/
if (chrome && chrome.devtools) {
  // If it is, let the devtools initialize the app
  window.VULCAN = initialize;
}
else {
  document.addEventListener('DOMContentLoaded', initialize);
}