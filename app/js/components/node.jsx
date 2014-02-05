/** @jsx React.DOM */
var Node = React.createClass({

  getInitialState: function() {
    return {
      hasChildren: false,
      numChildren: 0,
      children: null,
      name: null,
      value: null,
      expanded: false,
      ref: null
    };
  },

  componentWillMount: function() {
    this.props.ref.on('value', function(snapshot){

      // PUSH CHILDREN OF NODE TO AN ARRAY
      var children = [];
      if(snapshot.hasChildren()) {
        snapshot.forEach(function(childSnapshot){
          children.push(childSnapshot);
        });
      }
      else {
        children = null;
      }

      this.setState({
        hasChildren: snapshot.hasChildren(),
        numChildren: snapshot.numChildren(),
        children: children,
        name: snapshot.name(),
        value: snapshot.val()
      });

    }.bind(this));
  },

  render: function() {
    return (
      <li>
        {function(){
          if(this.state.hasChildren) {
            <ul></ul>
          }
          else {
            <strong>{this.state.name}</strong>
            <em>{this.state.value}</em>
          }
        }.bind(this)()}
      </li>
    );
  }
});

module.exports = Node;