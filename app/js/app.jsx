/** @jsx React.DOM */

var initialize = function () {

  var container = document.createElement('div');
      container.id = 'forge-stealth';

  document.body.appendChild(container);

  React.renderComponent(
    <h1>Hello, world!</h1>,
    container
  );

};

document.addEventListener('DOMContentLoaded', initialize);