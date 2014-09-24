/** @jsx React.DOM */
var React = require('react/addons');
var EventHub = require('./eventhub');
var ReactTransitionGroup = React.addons.TransitionGroup;
var AppMixins = require('./mixins');

var Node = React.createClass({
  mixins: [AppMixins],
  updateTimeout: null,

  listeners: {
    value: function(snapshot) {
      this.update(snapshot, {
        expandAll: this.props.expandAll,
        collapseAll: this.props.collapseAll
      });

      if(this.props.root && !this.firstRender) {
        this.props.onChange({
          priority: snapshot.getPriority(),
          status: 'changed'
        });
      }

      this.firstRender = false;
    },
    child_changed: function(snapshot, prevChildName) {
      this.flags[snapshot.name()] = 'changed';
    },
    child_added: function(snapshot, previousName) {
      if(this.firstRender === false && this.state.expanded) {
        this.flags[snapshot.name()] = 'added';
      }
    },
    child_removed: function(snapshot) {
      this.flags[snapshot.name()] = 'removed';
    },
    child_moved: function(snapshot, previousName) {
      this.flags[snapshot.name()] = 'moved';
    }
  },


  //CALLED BEFORE VERY FIRST INIT
  getInitialState: function() {
    this.firstRender = true;
    this.flags = {}; //USED TO TRACK STATE OF RECENTLY CHANGE NODE

    return {
      hasChildren: false,
      numChildren: 0,
      children: [],
      name: '',
      value: null,
      expanded: this.props.expandAll === true ? true : false,
      firebaseRef: null
    };
  },


  //CALLED ONCE ON FIRST INIT
  componentWillMount: function() {
    this.props.firebaseRef.on('value', this.listeners.value.bind(this), function(error) {
      if(error && error.code && this.props.root) {
        EventHub.publish('reset', error.code);
      }
    }.bind(this));

    //ONLY USED FOR ROOT NODE EVENTS
    if(this.props.root) {
      this._addEvents();
    }
  },


  componentWillUnmount: function() {
    this.props.firebaseRef.off();
  },


  componentDidUpdate: function() {
    //RESET STATUS TO NORMAL
    if(this.props.status !== 'normal' && this.props.status !== 'removed') {
      this.timeout = setTimeout(function() {
        this.props.onResetStatus(this);
      }.bind(this), 1000);
    }
  },


  componentWillReceiveProps: function (nextProps) {
    if (nextProps.expandAll === true) {
      this.update(this.state.snapshot, {
        expanded: true,
        expandAll: nextProps.expandAll
      });
    }
    else if (nextProps.collapseAll === true && this.props.root) {
      this.update(this.state.snapshot, {
        expandAll: nextProps.expandAll,
        collapseAll: nextProps.collapseAll
      });
    }
    else if (nextProps.collapseAll === true && !this.props.root) {
      this._collapse();
    }
  },


  //USER INITIATED METHODS
  toggle: function() {
    if(this.state.expanded) {
      this._collapse();
    }
    else {
      this._expand();
    }
  },


  _expand: function() {
    this._addEvents();
    this.update(this.state.snapshot, {
      expanded: true,
      expandAll: this.props.expandAll,
      collapseAll: this.props.collapseAll
    });
  },


  _collapse: function() {
    this._removeEvents();
    this.update(this.state.snapshot, {
      expanded: false,
      expandAll: this.props.expandAll,
      collapseAll: this.props.collapseAll
    });
  },


  getToggleText: function() {
    return this.state.expanded ? '-' : '+';
  },


  removeNode: function(e) {
    e.preventDefault();
    this.props.firebaseRef.remove(function(error) {
      if(error && error.code) {
        EventHub.publish('error', error.code);
      }
    }.bind(this));
  },


  editNode: function(e) {
    e.preventDefault();
    EventHub.publish('edit', this);
  },


  addNode: function(e) {
    e.preventDefault();
    EventHub.publish('add', this);
  },


  editPriority: function(e) {
    e.preventDefault();
    EventHub.publish('priority', this);
  },


  resetStatus: function(node) {
    //FORCE A RERENDER TO RESET ALL STATUS BACK TO NORMAL
    this.update(this.state.snapshot);
  },


  _removeEvents: function() {
    ['child_added', 'child_removed', 'child_changed', 'child_moved'].forEach(function(event) {
      this.props.firebaseRef.off(event);
    }, this);
  },


  _addEvents: function() {
    ['child_added', 'child_removed', 'child_changed', 'child_moved'].forEach(function(event) {
      this.props.firebaseRef.on(event, this.listeners[event].bind(this));
    }, this);
  },


  update: function(snapshot, options) {
    //CLEAR TIMEOUT
    if(this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    //SET THE NEW STATE
    this.updateTimeout = setTimeout(function() {

      options = options || {};
      var children = [];
      var expanded = (options.expanded !== undefined) ? options.expanded : this.state.expanded;
      var name = snapshot.name();

      //ROOT NODE ONLY
      if(this.props.root) {
        var rootName = this.props.firebaseRef.root().toString();
        var refName = this.props.firebaseRef.toString();
        expanded = true;

        if(refName === rootName) {
          name = refName.replace('https://', '').replace('.firebaseio.com', ''); //THIS IS THE ROOT NODE
        }
        else {
          name = refName.replace(rootName + '/', ''); //USING A CHILD NODE, STRIP EVERYTHING AWAY BUT NAME
        }
      }

      if(snapshot.hasChildren() && expanded) {
        //ITEM HAS BEEN REMOVED
        if(this.state.numChildren > snapshot.numChildren()) {
          children = this.createChildren(this.state.snapshot, options);
          //DELAY THE STATE CHANGE FOR THE HIGHLIGHT
          setTimeout(function(){
            this.setState({
              children: this.createChildren(snapshot, options)
            });
          }.bind(this), 1000);
        }
        //GET NEW LIST OF CHILDREN
        else {
          children = this.createChildren(snapshot, options);
        }
      }

      this.setState({
        snapshot: snapshot,
        hasChildren: snapshot.hasChildren(),
        numChildren: snapshot.numChildren(),
        children: children,
        expanded: expanded,
        name: name,
        value: snapshot.val()
      });
    }.bind(this), 50);
  },


  createChildren: function(snapshot, options) {
    options = options || {};
    var expandAll = options.expandAll || false;
    var collapseAll = options.collapseAll || false;
    var children = [];

    snapshot.forEach(function(child){
      var status = 'normal';

      //SEE IF NODE HAS A STATUS & DELETE FLAG
      if(this.flags[child.name()]) {
        status = this.flags[child.name()];
        delete this.flags[child.name()];
      }

      //CREATE A NODE
      var node = (
        <Node
          key={child.name()}
          firebaseRef={child.ref()}
          snapshot={child}
          expandAll={expandAll}
          collapseAll={collapseAll}
          onResetStatus={this.resetStatus}
          status={status}
          priority={child.getPriority()}
        />
      );

      children.push(node);
    }.bind(this));

    return children;
  },


  renderToggleButton: function() {
    var toggle = '';
    var pclass = this.prefixClass;

    if(this.state.hasChildren && !this.props.root) {
      toggle = <span className={pclass('toggle')} onClick={this.toggle}>{this.getToggleText()}</span>;
    }

    return toggle;
  },


  renderPriorityBadge: function() {
    var priority = '';
    var pclass = this.prefixClass;
    var hasPriority = this.hasPriority(this.props.priority);

    if(hasPriority) {
      priority = <em className={pclass('priority')}>{this.props.priority}</em>;
    }

    return priority;
  },


  renderButtons: function() {
    var pclass = this.prefixClass;
    var editButton = (!this.state.hasChildren) ? <button className={pclass('button button-small button-action l-pad-right')} onClick={this.editNode}>Edit</button> : '';
    var addButton = (this.state.hasChildren  || this.props.root) ? <button className={pclass('button button-small button-primary l-pad-right')} onClick={this.addNode}>Add</button> : '';
    var priorityButton = (this.state.hasChildren && !this.props.root) ? <button className={pclass('button button-small button-action l-pad-right')} onClick={this.editPriority}>Priority</button> : '';

    return (
      <div className={pclass('options')}>
        <div className={pclass('options-arrow')}></div>
        {editButton}
        {addButton}
        {priorityButton}
        <button className={pclass('button button-small button-caution')} onClick={this.removeNode}>Remove</button>
      </div>
    );
  },


  renderNumberOfChildren: function() {
    var numChildren = '';
    var pclass = this.prefixClass;

    if(this.state.hasChildren) {
      numChildren = <span className={pclass('num-children')}>({this.state.numChildren})</span>;
    }

    return numChildren;
  },


  renderChildren: function() {
    var children = {};
    var pclass = this.prefixClass;

    if(this.state.hasChildren && this.state.expanded) {
      children = (
        <ul className={pclass('child-list')}>
          {this.state.children}
        </ul>
      );
    }

    return children;
  },


  renderNodeValue: function() {
    var nodeValue = '';
    var isNull = this.state.value === null;
    var isRoot = this.props.root;
    var noChildren = !this.state.hasChildren;
    var pclass = this.prefixClass;

    if(isRoot && isNull) {
      nodeValue = <em className={pclass('value')}>null</em>;
    }
    else if(isRoot && noChildren) {
      nodeValue = <em className={pclass('value')}>{this.state.value + ''}</em>;
    }
    else if(!isRoot && noChildren) {
      nodeValue = <em className={pclass('value')}>{this.state.value + ''}</em>;
    }

    return nodeValue;
  },


  render: function() {
    var pclass = this.prefixClass;

    return (
      <li className={pclass('node')}>
        {this.renderToggleButton()}

        <div className={pclass(['container', "is-" + this.props.status])}>
          {this.renderButtons()}
          {this.renderPriorityBadge()}
          <strong className={pclass('name')}>{this.state.name}</strong>
          {this.renderNumberOfChildren()}
          {this.renderNodeValue()}
        </div>

        {this.renderChildren()}
      </li>
    );
  }
});

module.exports = Node;