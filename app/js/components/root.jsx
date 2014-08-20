/** @jsx React.DOM */
var React = require('react/addons');
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

  componentWillMount: function () {
    EventHub.subscribe('expandAll', function () {
      this.setState({
        expandAll: true,
        collapseAll: false
      });
    }.bind(this));
    EventHub.subscribe('collapseAll', function () {
      this.setState({
        expandAll: false,
        collapseAll: true
      });
    }.bind(this));
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
          firebaseRef={this.props.firebaseRef}
          root={true}
          expandAll={this.state.expandAll}
          collapseAll={this.state.collapseAll}
          onChange={this.updateStatus}
          onResetStatus={this.resetStatus}
          status={this.state.status}
          priority={this.state.priority}
        />
      </ul>
    )
  }
});

module.exports = Root;