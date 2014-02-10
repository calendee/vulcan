/** @jsx React.DOM */
var Wrapper = require('./components/container');

var initialize = function () {

  var container = document.createElement('div');
      container.id = 'forge-stealth';

  document.body.appendChild(container);

  React.renderComponent(<Wrapper />, container);
};

document.addEventListener('DOMContentLoaded', initialize);