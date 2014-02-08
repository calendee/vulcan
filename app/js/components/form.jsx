/** @jsx React.DOM */
module.exports = React.createClass({

  getInitialState: function() {
    return {
      mode: 'standard',
      key: '',
      nodeValue: '',
      parentKey: ''
    };
  },

  componentWillReceiveProps: function(nextProps) {
    console.log('props hit');
    if(nextProps.node) {
      var node = nextProps.node.state;
      var action = nextProps.action;
      var key = '';
      var nodeValue = '';
      var priority = '';

      if(action === 'edit') {
        key = node.name;
        nodeValue = node.value;
        priority = node.priority;
      }

      this.setState({
        key: key,
        nodeValue:  nodeValue,
        parentKey: '',
        priority: priority
      })
    }
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var form = e.currentTarget;
    var firebaseRef = this.props.node.props.firebaseRef;
    var key = form.key.value;
    var nodeValue = form.nodeValue.value;
    var priority = form.priority.value;

    firebaseRef.parent().child(key).set(nodeValue);
    firebaseRef.parent().child(key).setPriority(priority);
  },

  prefixClass: function(name) {
    var prefix = 'forge-stealth';
    // Convert the name to an array
    if (!Array.isArray(name)) {
      name = name.split(' ');
    }
    return name.reduce(function(classString, className) {
      return classString + ' ' + prefix + '-' + className;
    }, '').replace(/^\s|\s$/g, '');
  },

  handleKeyUp: function(e) {
    console.log(this.refs.nodeValue.getDOMNode().value);
    this.setState({nodeValue: this.refs.nodeValue.getDOMNode().value});
  },

  render: function() {
    var pclass = this.prefixClass;
    var nodeValue = this.state.nodeValue;

    return (
      <form onSubmit={this.handleSubmit} className={pclass(['form', this.props.action])}>
        <header className={pclass('form-header')}>
          <a>Value</a>
          <a>Child</a>
          <a>JSON</a>
        </header>

        {/* JSON FORM */}
        <div className={pclass(['form-body', this.state.mode])}>

          {/* STANDARD FORM */}
          <div className={pclass('form-standard')}>
            <div className="standard-row">
              <label>Key</label>
              <input  type="text" name="key" value={this.state.key}/>

              <label>Value</label>
              <input ref="nodeValue" type="text" name="nodeValue" value={nodeValue} onKeyUp={this.handleKeyUp} />
            </div>

            <div className="prio-row">
              <label>Prio</label>
              <input ref="priority" type="text" name="priority" value={this.state.priority} />
            </div>
          </div>

          {/* CHILD ADD FORM */}
          <div className={pclass('form-add-child')}>
            <div className="parent-row">
              <label>Key</label>
              <input type="text" name="parent-key" />
            </div>
            <div className="standard-row">
              <label>Child Key</label>
              <input type="text" name="child-key" />
              <label>Child Value</label>
              <input type="text" name="child-value" />
            </div>

            <div className="prio-row">
              <label>Prio</label>
              <input type="text" name="prio" />
            </div>
          </div>
        </div>

        <footer>
          <input type="submit" value="Done" />
        </footer>
      </form>
    )
  }
});

