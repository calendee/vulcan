/** @jsx React.DOM */
var Node = React.createClass({

  //this.state is the current view
  // this.children is the current working copy, comes from on.value
  // ? Get the current changed item from other events

  // CHILD EVENTS
  // 1. Child event fires
  // 2. Look up child in this.state
  // 3. Update the status on that child
  // 4. Settimeout then push the real data to this.state
  // 5. Eventhing updates automatically

  // ADDING A NODE IN GENERAL
  // A. Node checks if it is expanded
  // B.
  // 1. REACT calls componentWillMount
  // 2. Components checks props for its status
  // 3. Settimeout then change status to normal


  //CALLED BEFORE VERY FIRST INIT, FIRST THING THAT GETS CALLED!
  getInitialState: function() {
    this.numChildrenRendered = 0;
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
      status: this.props.status || 'normal', //normal, changed, removed, updated
      expanded: false,
      firebaseRef: null,
      priority: null
    };
  },

  //ONLY CALLED ON FIRST INIT
  componentWillMount: function() {
    this.props.firebaseRef.on('value', this.listeners.value.bind(this));
  },

  //CALLED WHEN ITEM IS BEING REMOVED
  componentWillUnMount: function() {
    this.props.firebaseRef.off();
  },

  //CALL RIGHT AFTER ELEMENT IS RENDERED
  componentDidUpdate: function() {
    setTimeout(function() {
      if(this.state.status !== 'normal') {
        this.setState({status: 'normal'});
      }
    }.bind(this), 1000);
  },

  update: function(snapshot, options) {
    options = options || {};
    var children = [];
    var expanded = (options.expanded !== undefined) ? options.expanded : this.state.expanded;
    var name = snapshot.name();
    var status = options.status || 'normal';

    //ROOT NODE ONLY
    if(this.props.root) {
      name = 'ROOT'; //CHANGE TO REAL NAME OF FIREBASE AT SOME POINT
      expanded = true;
    }



    //I HAVE CHILDREN, CREATE THEM
    if(snapshot.hasChildren() && expanded) {
      children = this.createChildren(snapshot);
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
    },
    function() {
      //ONLY USED FOR ROOT NODE EVENTS
      if(this.props.root && snapshot.hasChildren()) {
        ['child_added', 'child_removed', 'child_moved', 'child_changed'].forEach(function(event) {
          this.props.firebaseRef.on(event, this.listeners[event].bind(this));
        }, this);
      }
    }.bind(this));
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
    this.numChildrenRendered = 0;

    //ADD ALL EVENTS
    ['child_added', 'child_removed', 'child_moved', 'child_changed'].forEach(function(event) {
      this.props.firebaseRef.on(event, this.listeners[event].bind(this));
    }, this);

    //SET STATE TO EXPANDED
    this.update(this.state.snapshot, {expanded: true});
  },

  collapseList: function() {
    //REMOVE ALL EVENTS
    ['child_added', 'child_removed', 'child_moved', 'child_changed'].forEach(function(event) {
      this.props.firebaseRef.off(event, this.listeners[event].bind(this));
    }, this);

    //SET STATE TO NOT EXPANDED
    this.update(this.state.snapshot, {expanded: false});
  },

  listeners: {
    //ONLY CALLED FROM FIREBASE ON VALUE EVENT
    value: function(snapshot) {
      //DON'T UPDATE STATUS FOR FIRST RENDER EVENT
      var status = this.firstRender ? this.props.status : 'changed';
      this.firstRender = false;

      this.update(snapshot, {status: status});
    },

    child_added: function(snapshot, previousName) {
      if(this.numChildrenRendered >= this.state.numChildren) {
        this.flags[snapshot.name()] = 'added';
      }

      //INCREMENT NUMBER OF CHILDREN IN DOME
      this.numChildrenRendered++;
    },
    child_removed: function(snapshot) {
      //this.numChildrenRendered--;
    },
    child_changed: function(snapshot, previousName) {
      //var node = this.children[snapshot.name()];
      //node.setState({ status: 'changed' });
    },
    child_moved: function(snapshot, previousName) {
      //var node = this.children[snapshot.name()];
      //node.setState({ status: 'moved' });
    }
  },

  getToggleText: function() {
    return this.state.expanded ? '-' : '+';
  },

  prefixClass: function(name) {
    return 'forge-stealth-' + name;
  },

  render: function() {
    var pclass = this.prefixClass;
    return (
      <li>
        {function(){
          //SHOW NUMBER OF CHILDREN
          if(this.state.hasChildren) {
            return <span className={pclass('num-children')}>{this.state.numChildren}</span>
          }
        }.bind(this)()}

        {function(){
          //SHOW BUTTON
          if(this.state.hasChildren && !this.props.root) {
            return <button onClick={this.toggle}>{this.getToggleText()}</button>
          }
        }.bind(this)()}

        {function(){
          //SHOW PRIORITY
          if(this.state.priority !== null) {
            return <em className={pclass('priority')}>{this.state.priority}</em>
          }
        }.bind(this)()}

        <strong className={'forge-stealth-name ' + 'forge-stealth-' + this.state.status}>{this.state.name}</strong>


        {function(){
          //VALUE FOR NODE

          //1. TREE OF CHILDREN
          if(this.state.hasChildren && this.state.expanded) {
            return (
              <ul>
                {this.state.children}
              </ul>
            )
          }
          else if(!this.state.hasChildren && !this.props.root) {
            //2. VALUE (LEAF)
            return <em>{this.state.value}</em>
          }
          else if(this.state.value === null) {
            //3. VALUE (NULL) ROOT
            return <em>null</em>
          }
        }.bind(this)()}
      </li>
    );
  }
});

module.exports = Node;