/** @jsx React.DOM */
var React = require('react/addons');
var EventHub = require('./eventhub');
var ReactTransitionGroup = React.addons.TransitionGroup;
var AppMixins = require('./mixins');

var Node = React.createClass({
  mixins: [AppMixins],

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
    this.props.firebaseRef.remove();
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

    //SET THE NEW STATE
    this.setState({
      snapshot: snapshot,
      hasChildren: snapshot.hasChildren(),
      numChildren: snapshot.numChildren(),
      children: children,
      expanded: expanded,
      name: name,
      value: snapshot.val()
    });
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

  render: function() {
    var pclass = this.prefixClass;

    return (
      <li className={pclass('node')}>
        {function(){
          //SHOW BUTTON
          if(this.state.hasChildren && !this.props.root) {
            return <span className={pclass('toggle')} onClick={this.toggle}>{this.getToggleText()}</span>
          }
        }.bind(this)()}

        <div className={pclass(['container', "is-" + this.props.status])}>

          {/* HOVER OPTIONS */}
          {function(){
            if(this.state.hasChildren || this.props.root) {
              return (
                <div className={pclass('options')}>
                  <div className={pclass('options-arrow')}></div>
                  <button className={pclass('button button-small button-primary l-pad-right')} onClick={this.addNode}>Add</button>
                  <button className={pclass('button button-small button-action l-pad-right')} onClick={this.editPriority}>Priority</button>
                  <button className={pclass('button button-small button-caution')} onClick={this.removeNode}>Remove</button>
                </div>
              )
            }
            else {
              return (
                <div className={pclass('options')}>
                  <div className={pclass('options-arrow')}></div>
                  <button className={pclass('button button-small button-action l-pad-right')} onClick={this.editNode}>Edit</button>
                  <button className={pclass('button button-small button-caution')} onClick={this.removeNode}>Remove</button>
                </div>
              )
            }
          }.bind(this)()}


          {/* PRIORITY */}
          {function(){
            var hasPriority = this.hasPriority(this.props.priority);

            if(hasPriority) {
              return <em className={pclass('priority')}>{this.props.priority}</em>;
            }
          }.bind(this)()}

          {/* KEY (NAME) */}
          <strong className={pclass('name')}>{this.state.name}</strong>

          {/* NUMBER OF CHILDREN */}
          {function(){
            if(this.state.hasChildren) {
              return <span className={pclass('num-children')}>({this.state.numChildren})</span>
            }
          }.bind(this)()}


          {/* VALUE */}
          {function(){
            var isNull = this.state.value === null;
            var isRoot = this.props.root;
            var noChildren = !this.state.hasChildren;

            if(isRoot && isNull) {
              return <em className={pclass('value')}>null</em>
            }
            else if(isRoot && noChildren) {
              return <em className={pclass('value')}>{this.state.value}</em>
            }
            else if(!isRoot && noChildren) {
              return <em className={pclass('value')}>{this.state.value}</em>
            }
          }.bind(this)()}
        </div>

        {function(){
          //1. TREE OF CHILDREN
          if(this.state.hasChildren && this.state.expanded) {
            return (
              <ul className={pclass('child-list')}>
                  {this.state.children}
              </ul>
            )
          }
        }.bind(this)()}
      </li>
    );
  }
});

module.exports = Node;
