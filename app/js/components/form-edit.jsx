/** @jsx React.DOM */
var AppMixins = require('./mixins');

module.exports = React.createClass({
  mixins: [AppMixins, React.addons.LinkedStateMixin],

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
    var form = e.target;

    //GET FORM AND CALL CORRECT METHOD
    switch(this.props.action) {
      case 'edit': this.updateNode(form); break;
      case 'priority': this.updatePriority(form); break;
      case 'add':
        if(this.state.addMode === 'child')  {
          this.saveChildNode(form);
        }
        if(this.state.addMode === 'branch')  {
          this.saveBranchNode(form);
        }
        if(this.state.addMode === 'json')  {
          this.saveJsonNode(form);
        }
      break;
    }

    this.closeForm();
  },

  saveChildNode: function(form) {
    var key = form.key.value.trim();
    var value = form.value.value.trim();
    var priority = form.priority.value.trim() || null;

    if(value && key) {
      this.state.firebaseRef.child(key).setWithPriority(value, priority);
    }
  },

  saveBranchNode: function(form) {
    var parentKey = form.parentKey.value.trim();
    var parentPriority = form.parentPriority.value.trim() || null;

    var key = form.key.value.trim();
    var value = form.value.value.trim();
    var priority = form.priority.value.trim() || null;

    if(parentKey && key && value) {
      var childData = {};
      childData[key] = value;

      //CREATE PARENT WITH DATA AND PRIORITY
      this.state.firebaseRef.child(parentKey).setWithPriority(childData, parentPriority, function() {
        //UPDATE CHILD PRIORITY
        this.state.firebaseRef.child(parentKey).child(key).setPriority(priority);
      }.bind(this));
    }
  },

  saveJsonNode: function(form) {
    var key = form.key.value.trim();
    var json = JSON.parse(form.json.value.trim());
    var priority = form.priority.value.trim() || null;

    if(json && key) {
      console.log(json);
      this.state.firebaseRef.child(key).setWithPriority(json, priority);
    }
  },

  updateNode: function(form) {
    var priority = form.priority.value.trim() || null;
    var value = form.value.value.trim();

    if(value) {
      this.state.firebaseRef.setWithPriority(value, priority);
      this.closeForm();
    }
  },

  updatePriority: function(form){
    var priority = form.priority.value.trim() || null;

    this.state.firebaseRef.setPriority(priority);
    this.closeForm();
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
        <form onSubmit={this.handleSubmit} className={pclass(['form', this.props.action])}>

          {function() {
            //EDIT PRIORITY
            if(this.props.action === 'priority') {
              return (
                <div>
                  <header className={pclass('form-header')}>Editing Priority for {this.state.name}</header>
                  <ul>
                    <li>
                      <label>Priority</label>
                      <input type="text" name="priority" valueLink={this.linkState('priority')} />
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
                      <input type="text" name="value" valueLink={this.linkState('value')} />

                      <label>Priority</label>
                      <input type="text" name="priority" valueLink={this.linkState('priority')} />
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
                    <textarea name="json"></textarea>

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

