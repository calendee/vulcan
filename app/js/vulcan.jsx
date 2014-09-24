/** @jsx React.DOM */

/*
* Import React Components
*
*/

var React = require('react/addons');
window.React = React;
var Wrapper = require('./components/container');


/*
* Initialize Method
*
*/

var initialize = function (options) {
  options = options || {};

  //CREATE DOM CONTAINER
  var container = document.createElement('div');
  container.id = 'vulcan';
  document.body.appendChild(container);

  // ADD REACT COMPONENT
  React.renderComponent(<Wrapper options={options} />, container);
};


/*
* Initialize Application
*
*/

if (chrome && chrome.devtools) {
  // LET DEV TOOLS INITIALIZE APP
  window.VULCAN = initialize;
}
else {
  // INITIALIZE IN BROWSER
  document.addEventListener('DOMContentLoaded', initialize);
}