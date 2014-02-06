/** @jsx React.DOM */
var Node = React.createClass({

  getInitialState: function() {
    return {
      hasChildren: false,
      numChildren: 0,
      children: null,
      name: 'root',
      value: null,
      status: 'normal', //normal, changed, removed, updated
      expanded: this.props.root ? true : false,
      ref: null,
      priority: null
    };
  },

  //ITEM IS BEING REMOVED
  componentWillUnMount: function() {
    this.props.ref.off('value');
  },

  componentDidUpdate: function() {
    setTimeout(function() {
      if(this.state.status !== 'normal') {
        this.setState({status: 'normal'});
      }
    }.bind(this), 1000);
  },

  //ITEM IS BEING ADDED
  componentWillMount: function() {
    this.props.ref.on('value', function(snapshot){
      var hasChildren = snapshot.hasChildren();

      // PUSH CHILDREN OF NODE TO AN ARRAY
      var children = [];
      if(hasChildren) {
        snapshot.forEach(function(childSnapshot){
          children.push(childSnapshot);
        });
      }
      else {
        children = null;
      }

      this.setState({
        hasChildren: hasChildren,
        numChildren: snapshot.numChildren(),
        children: children,
        name: snapshot.name() || 'root',
        value: snapshot.val(),
        priority: snapshot.getPriority()
      });

    }.bind(this));

    this.props.ref.on('child_changed', function(childSnapshot, prevChildName) {
      this.setState({status: 'changed'});
    }.bind(this));
  },

  toggle: function() {
    this.setState({
      expanded: !this.state.expanded
    });
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
      <li className={'forge-stealth-' + this.state.status}>
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

        <strong className={pclass('name')}>{this.state.name}</strong>

        {function(){
          //VALUE FOR NODE

          //1. TREE OF CHILDREN
          if(this.state.hasChildren && this.state.expanded) {
            return (
              <ul>
                {this.state.children.map(function(child) {
                  return <Node key={child.name()} ref={child.ref()}/>
                })}
              </ul>
            )
          }
          else if(!this.state.hasChildren && !this.props.root) {
            //2. VALUE (LEAF)
            return <em>{this.state.value}</em>
          }
          else if(this.state.value === null) {
            //3. VALUE (NULL)
            return <em>null</em>
          }
        }.bind(this)()}
      </li>
    );
  }
});

module.exports = Node;