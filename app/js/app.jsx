/** @jsx React.DOM */
var Wrapper = require('./components/wrapper');

var initialize = function () {

  var container = document.createElement('div');
      container.id = 'forge-stealth';
      container.className = 'forge-translucent';

  document.body.appendChild(container);

  React.renderComponent(<Wrapper />, container);
};

document.addEventListener('DOMContentLoaded', initialize);