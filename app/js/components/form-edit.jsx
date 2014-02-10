/** @jsx React.DOM */
var AppMixins = require('./mixins');

module.exports = React.createClass({
  mixins: [AppMixins],

  getInitialState: function() {
    var node = this.props.node;

    return {
      hasChildren: node.state.hasChildren,
      hasChildren: node.state.numChildren,
      name: node.state.name,
      value: node.state.value,
      priority: node.state.priority,
      firebaseRef: node.props.firebaseRef,
      addMode: 'child' //child, branch, json
    };
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var firebaseRef = this.props.node.props.firebaseRef;

    firebaseRef.child(key).set(nodeValue);

    if(priority) {
      firebaseRef.child(key).setPriority(priority);
    }

    this.closeForm();
  },

  updateValue: function(e) {
    this.setState({value: e.target.value});
  },

  closeForm: function() {
    this.props.onComplete();
  },

  addChildMode: function() {
    this.setState({addMode: 'child'});
  },

  addBranchMode: function() {
    this.setState({addMode: 'branch'});
  },

  addJsonMode: function() {
    this.setState({addMode: 'json'});
  },

  render: function() {
    var pclass = this.prefixClass;

    return (
      <div>
        <div className={pclass('form-overlay')}></div>
        <form onSubmit={this.addNode} className={pclass(['form', this.props.action])}>


          {function() {
            //EDIT PRIORITY
            if(this.props.action === 'priority') {
              return (
                <div>
                  <header className={pclass('form-header')}>Editing Priority for {this.state.name}</header>
                  <ul>
                    <li>
                      <label>Priority</label>
                      <input type="text" name="priority" />
                    </li>
                  </ul>
                </div>
              )
            }
          }.bind(this)()}


          {function() {
            //EDIT EXISTING NODE
            if(this.props.action === 'edit') {
              return (
                <div>
                  <header className={pclass('form-header')}>Editing {this.state.name}</header>
                  <ul>
                    <li>
                      <label>{this.state.name}</label>

                      <label>Value</label>
                      <input type="text" name="value" value={this.state.value} onChange={this.updateValue}/>

                      <label>Priority</label>
                      <input type="text" name="priority" value={this.state.priority} />
                    </li>
                  </ul>
                </div>
              )
            }
          }.bind(this)()}


          {function() {
            //HEADER NAV
            if(this.props.action === 'add') {
              return (
                <header className={pclass('form-header')}>
                  <h3>Adding Child to {this.state.name}</h3>

                  <nav className={pclass('form-nav')}>
                    <a onClick={this.addChildMode}>Child</a>
                    <a onClick={this.addBranchMode}>Branch</a>
                    <a onClick={this.addJsonMode}>JSON</a>
                  </nav>
                </header>
              )
            }
          }.bind(this)()}


          {function() {
            //ADDING CHILD
            if(this.props.action === 'add' && this.state.addMode === 'child') {
              return (
                <ul>
                  <li>
                    <label>Key</label>
                    <input  type="text" name="key" />:

                    <label>Value</label>
                    <input type="text" name="value"  />

                    <label>Priority</label>
                    <input type="text" name="priority"  />
                  </li>
                </ul>
              )
            }
          }.bind(this)()}


          {function() {
            //ADDING BRANCH
            if(this.props.action === 'add' && this.state.addMode === 'branch') {
              return (
                <ul>
                  <li>
                    <label>Parent Key</label>
                    <input  type="text" name="parentKey" />:

                    <label>Priority</label>
                    <input type="text" name="parentPriority" />
                  </li>

                  <li>
                    <label>Key</label>
                    <input  type="text" name="key" />:

                    <label>Value</label>
                    <input type="text" name="value"  />

                    <label>Priority</label>
                    <input type="text" name="priority"  />
                  </li>
                </ul>
              )
            }
          }.bind(this)()}


          {function() {
            //ADDING JSON
            if(this.props.action === 'add' && this.state.addMode === 'json') {
              return (
                <ul>
                  <li>
                    <label>Key</label>
                    <input  type="text" name="key" />

                    <label>Value</label>
                    <textarea name="value"></textarea>

                    <label>Priority</label>
                    <input type="text" name="priority" />
                  </li>
                </ul>
              )
            }
          }.bind(this)()}

          <footer  className={pclass('form-footer')}>
            <input type="submit" value="Done"  className={pclass('button-primary')} />
            <a className={pclass('button-secondary')} onClick={this.closeForm}>Cancel</a>
          </footer>
        </form>
      </div>
    )
  }
});

