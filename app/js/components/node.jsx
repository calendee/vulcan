/** @jsx React.DOM */
var Node = React.createClass({

  getInitialState: function() {
    return {
      hasChildren: false,
      numChildren: 0,
      children: null,
      name: 'root',
      value: null,
      expanded: this.props.root ? true : false,
      ref: null
    };
  },

  componentWillMount: function() {
    this.props.ref.on('value', function(snapshot){
      var hasChildren = snapshot.hasChildren();
      console.log(snapshot)

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

      console.log(this.state);
    }.bind(this));
  },

  toggle: function() {
    this.setState({
      expanded: true
    });
  },

  getToggleText: function() {
    return this.state.expanded ? '-' : '+';
  },

  render: function() {
    return (
      <li>
        <button onClick={this.toggle}>{this.getToggleText()}</button> <strong>{this.state.name}</strong> - <em>priority: {this.state.priority}</em>

        {function(){
          if(this.state.hasChildren && this.state.expanded) {

            //blah
            return (
              <ul>
                {this.state.children.map(function(child) {
                  return <Node key={child.name()} ref={child.ref()}/>
                })}
              </ul>
            )
          }
          else if(this.state.hasChildren) {
            return <span>{this.state.numChildren}</span>
          }
          else {
            return <em>{this.state.value}</em>
          }
        }.bind(this)()}
      </li>
    );
  }
});

module.exports = Node;