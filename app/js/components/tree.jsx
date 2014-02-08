/** @jsx React.DOM */
var Node = require('./node');

module.exports = React.createClass({

  render: function() {
    return (
      <ul className="forge-stealth-root-list">
        <Node root={true} firebaseRef={this.props.firebaseRef} status="normal" />
      </ul>
    );
  }

});