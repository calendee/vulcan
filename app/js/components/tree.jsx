/** @jsx React.DOM */
var Node = require('./node');

module.exports = React.createClass({


  render: function() {

    return (
      <div>They I am {this.props.ref.toString()}</div>
    );
  }
});