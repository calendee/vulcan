/** @jsx React.DOM */
var Node = require('./node');

module.exports = React.createClass({

  render: function() {
    return (
      <ul>
        <Node root={true} ref={this.props.ref} />
      </ul>
    );
  }

});