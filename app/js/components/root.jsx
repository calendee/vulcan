/** @jsx React.DOM */
var EventHub = require('./eventhub');
var AppMixins = require('./mixins');
var Node = require('./node');

var Root = React.createClass({
  mixins: [AppMixins],

  getInitialState: function() {
    return {
      status: 'normal',
      priority: null,
      expandAll: false,
      collapseAll: false
    };
  },

  resetStatus: function(node) {
    this.setState({status: 'normal'});
  },

  updateStatus: function(data) {
    this.setState(data);
  },

  render: function() {
    var pclass = this.prefixClass;

    return (
      <ul className={pclass("root-list")}>
        <Node
          key="root"
          root={true}
          onChange={this.updateStatus}
          onResetStatus={this.resetStatus}
          firebaseRef={this.props.firebaseRef}
          status={this.state.status}
          priority={this.state.priority}
        />
      </ul>
    )
  }
});

module.exports = Root;