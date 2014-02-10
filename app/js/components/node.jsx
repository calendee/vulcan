/** @jsx React.DOM */
var EventHub = require('./eventhub');
var ReactTransitionGroup = React.addons.TransitionGroup;
var AppMixins = require('./mixins');

var Node = React.createClass({
  mixins: [AppMixins],

  //CALLED BEFORE VERY FIRST INIT, FIRST THING THAT GETS CALLED!
  getInitialState: function() {
    this.firstRender = true;

    //FLAGS TO TRACK THE INTERNAL STATE OF THINGS.
    this.flags = {
      //nodename: 'added'
    };

    return {
      hasChildren: false,
      numChildren: 0,
      children: [],
      name: '',
      value: null,
      status: this.props.status, //normal, changed, removed, updated
      expanded: false,
      firebaseRef: null,
      priority: null
    };
  },

  //ONLY CALLED ON FIRST INIT
  componentWillMount: function() {
    this.props.firebaseRef.on('value', this.listeners.value.bind(this));

    //ONLY USED FOR ROOT NODE EVENTS
    if(this.props.root) {
      ['child_added', 'child_removed', 'child_changed', 'child_moved'].forEach(function(event) {
        this.props.firebaseRef.on(event, this.listeners[event].bind(this));
      }, this);
    }
  },

  //CALLED WHEN ITEM IS BEING REMOVED
  componentWillUnmount: function() {
    //REMOVE ALL EVENTS
    this.props.firebaseRef.off();
  },

  //LISTEN FOR CHANGES ON PROPERTIES AND UPDATE STATE
  componentWillReceiveProps: function(nextProps) {
    //IF STATUS IS DIFFERENT
    this.setState({status: nextProps.status});
  },

  //CALL RIGHT AFTER ELEMENT IS UPDATED
  componentDidUpdate: function() {
    this.resetStatus();
  },

  resetStatus: function() {
    if(this.state.status !== 'normal' && this.state.status !== 'removed') {
      this.timeout = setTimeout(function() {
          this.setState({status: 'normal'});
      }.bind(this), 1000);
    }
  },

  update: function(snapshot, options) {
    options = options || {};
    var children = [];
    var expanded = (options.expanded !== undefined) ? options.expanded : this.state.expanded;
    var name = snapshot.name();
    var status = this.state.status;

    //ROOT NODE ONLY
    if(this.props.root) {
      var realRoot = this.props.firebaseRef.root().toString();
      var refName = this.props.firebaseRef.toString();

      //IF WE'RE AT THE ROOT, JUST STRIP META INFO
      if(refName === realRoot) {
        name = refName.replace('https://', '').replace('.firebaseio.com', ''); //CHANGE TO REAL NAME OF FIREBASE AT SOME POINT
      }
      // STRIP THE ROOT DOMAIN AND SHOW THE CURRENT LOCATION NAME
      else {
        name = refName.replace(realRoot + '/', ''); //CHANGE TO REAL NAME OF FIREBASE AT SOME POINT
      }
      expanded = true;
      status = 'changed';
    }

    //I HAVE CHILDREN, CREATE THEM
    if(snapshot.hasChildren() && expanded) {
      //ITEM HAS BEEN REMOVED
      if(this.state.numChildren > snapshot.numChildren()) {
        children = this.createChildren(this.state.snapshot);

        setTimeout(function(){
          this.setState({children: this.createChildren(snapshot)});
        }.bind(this), 1000);
      }
      //GET NEW LIST OF CHILDREN
      else {
        children = this.createChildren(snapshot);
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
      status: status,
      value: snapshot.val(),
      priority: snapshot.getPriority()
    });
  },

  createChildren: function(snapshot) {
    var children = [];

    snapshot.forEach(function(child){
      var status = 'normal';

      //GET THE STATUS FLAG FOR THIS NODE
      if(this.flags[child.name()]) {

        //SET NEW STATUS
        status = this.flags[child.name()];

        //NOW DELETE THE FLAG
        delete this.flags[child.name()];
      }

      //CREATE A NODE
      var node = <Node key={child.name()} firebaseRef={child.ref()} snapshot={child} status={status}/>;
      //ADD TO DICTIONARY AND ARRAY
      children.push(node);
    }.bind(this));

    return children;
  },


  //USER INITIATED METHODS
  toggle: function() {
    if(this.state.expanded) {
      this.collapseList();
    }
    else {
      this.expandList();
    }
  },

  expandList: function() {
    //ADD ALL EVENTS
    ['child_added', 'child_removed', 'child_changed', 'child_moved'].forEach(function(event) {
      this.props.firebaseRef.on(event, this.listeners[event].bind(this));
    }, this);

    //SET STATE TO EXPANDED
    this.update(this.state.snapshot, {expanded: true});
  },

  collapseList: function() {
    //REMOVE ALL EVENTS
    ['child_added', 'child_removed', 'child_changed', 'child_moved'].forEach(function(event) {
      this.props.firebaseRef.off(event);
    }, this);

    //SET STATE TO NOT EXPANDED
    this.update(this.state.snapshot, {expanded: false});
  },

  listeners: {

    //Called when all other events have completed
    value: function(snapshot) {
      this.update(snapshot);
      this.firstRender = false;
    },

    child_changed: function(snapshot, prevChildName) {
      this.flags[snapshot.name()] = 'changed';
    },

    //called many times
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

  render: function() {
    var pclass = this.prefixClass;

    return (
      <li ref="alex" className={pclass('node')}>
        {function(){
          //SHOW BUTTON
          if(this.state.hasChildren && !this.props.root) {
            return <span className={pclass('toggle')} onClick={this.toggle}>{this.getToggleText()}</span>
          }
        }.bind(this)()}

        <div className={pclass(['container', this.state.status])}>

          {/* HOVER OPTIONS */}
          {function(){
            if(this.state.hasChildren) {
              return (
                <div className={pclass('options')}>
                  <button onClick={this.addNode}>Add</button>
                  <button onClick={this.editPriority}>Priority</button>
                  <button onClick={this.removeNode}>Remove</button>
                </div>
              )
            }
            else {
              return (
                <div className={pclass('options')}>
                  <button onClick={this.editNode}>Edit</button>
                  <button onClick={this.removeNode}>Remove</button>
                </div>
              )
            }
          }.bind(this)()}


          {/* PRIORITY */}
          {function(){
            if(this.state.priority !== null) {
              return <em className={pclass('priority')}>{this.state.priority}</em>
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
            if(!this.state.hasChildren && !this.props.root) {
              //2. VALUE (LEAF)
              return <em className={pclass('value')}>{this.state.value}</em>
            }
            else if(this.state.value === null) {
              //3. VALUE (NULL) ROOT
              return <em className={pclass('value')}>null</em>
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