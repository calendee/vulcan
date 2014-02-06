/** @jsx React.DOM */
var Node = React.createClass({


  getInitialState: function() {
    this.childen = {};
    this.childrenArray = [];

    return {
      hasChildren: false,
      numChildren: 0,
      children: [],
      name: 'root',
      value: null,
      status: 'normal', //normal, changed, removed, updated
      expanded: false,
      ref: null,
      priority: null
    };
  },

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

  //ITEM IS BEING ADDED
  componentWillMount: function() {
    //AUTO EXPAND FOR ROOT NODE
    if(this.props.root) {
      this.props.ref.on('value', this.update.bind(this));
    }
  },

  componentWillReceiveProps: function(){
    if(this.props.snapshot) {
      this.update(snapshot);
    }
  },

  update: function(snapshot) {
     this.setState({
      hasChildren: snapshot.hasChildren(),
      numChildren: snapshot.numChildren(),
      name: snapshot.name() || 'root',
      value: snapshot.val(),
      status: 'changed',
      priority: snapshot.getPriority()
    }, function() {
      if(this.props.root && this.state.hasChildren && !this.state.expanded) {
        this.expand();
      }
    }.bind(this));
  },

  toggle: function() {
    if(this.state.expanded) {
      this.collapse();
    }
    else {
      this.expand();
    }
  },

  expand: function() {
    //RESET DATA FOR CHILDEN ARRAY AND DICTIONARY
    this.childrenArray = [];
    this.children = {};

    snapshot.forEach(function(child){
      //CREATE A NODE
      var node = <Node key={child.name()} ref={child.ref()} snapshot={child} status="normal"/>;

      //ADD TO DICTIONARY AND ARRAY
      this.childrenArray.push(node);
      this.children[child.name()] = node;
    }.bind(this));


    //ADD ALL EVENTS
    ['child_added', 'child_removed', 'child_removed', 'child_changed'].forEach(function(event) {
        this.props.ref.on(event, this.listeners[event].bind(this));
    }, this);

    //SET STATE TO EXPANDED
    this.setState({
      expanded: true,
      children: this.childrenArray
    });
  },

  collapse: function() {
    //REMOVE ALL EVENTS
    ['child_added', 'child_removed', 'child_removed', 'child_changed'].forEach(function(event) {
        this.props.ref.off(event, this.listeners[event].bind(this));
    }, this);

    //SET STATE TO NOT EXPANDED
    this.setState({expanded: false});
  },

  listeners: {
    value: function(snapshot) {
      //HAVE CHILDREN

    },

    child_added: function(snapshot, previousName) {

    },
    child_removed: function(snapshot) {

    },
    child_changed: function(snapshot, previousName) {

    },
    child_moved: function(snapshot, previousName) {

    }
  },


  //ITEM IS BEING REMOVED
  componentWillUnMount: function() {



    this.props.ref.off();
  },

  componentDidUpdate: function() {
    setTimeout(function() {
      if(this.state.status !== 'normal') {
        this.setState({status: 'normal'});
      }
    }.bind(this), 1000);
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