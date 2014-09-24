/** @jsx React.DOM */
var React = require('react/addons');
var EventHub = require('./eventhub');
var AppMixins = require('./mixins');
var Node = require('./node');


/*
* ROOT NODE COMPONENT
*
* The root node element for the data tree
*/

var Root = React.createClass({
  mixins: [AppMixins],

  /*
  * getInitialState
  *
  * The return value will be used as the initial value of this.state
  */

  getInitialState: function() {
    return {
      status: 'normal',
      priority: null,
      expandAll: false,
      collapseAll: false
    };
  },


  /*
  * componentWillMount
  *
  * Invoked once, both on the client and server,
  * immediately before the initial rendering occurs.
  */

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


  /*
  * resetStatus
  *
  * Resets the status back to normal
  */

  resetStatus: function(node) {
    this.setState({status: 'normal'});
  },


  /*
  * updateStatus
  *
  * Updates the status with new data
  */

  updateStatus: function(data) {
    this.setState(data);
  },


  /*
  * render
  *
  * When called, it should examine this.props and
  * this.state and return a single child component.
  */

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