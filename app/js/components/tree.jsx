/** @jsx React.DOM */
module.exports = React.createClass({
  render: function() {

    return (
      <div>They I am {this.props.ref.toString()}</div>
    );
  }
});