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
              this.closeForm();

      }.bind(this));
    }
  },

  saveJsonNode: function(form) {
    var key = form.key.value.trim();
    var json = JSON.parse(form.json.value.trim());
    var priority = form.priority.value.trim() || null;

    if(json && key) {
      this.state.firebaseRef.child(key).setWithPriority(json, priority);
      this.closeForm();
    }
  },

  updateNode: function(form) {
    var priority = form.priority.value.trim() || null;
    var value = form.value.value.trim();

    if(value !== undefined && value !== '') {
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
    var cx = React.addons.classSet;

    //OPTIONS FOR PINNING STATE
    var navClasses = cx({
      'forge-stealth-form-nav': true,
      'forge-stealth-nav-child-selected': this.state.addMode === 'child',
      'forge-stealth-nav-branch-selected': this.state.addMode === 'branch',
      'forge-stealth-nav-json-selected': this.state.addMode === 'json'
    });

    return (
      <div>
        <div className={pclass('form-overlay')}></div>
        <form onSubmit={this.handleSubmit} className={pclass(['form', this.props.action])}>

          {function() {
            //EDIT PRIORITY
            if(this.props.action === 'priority') {
              return (
                <div>
                  <header className={pclass('form-header')}><h3>Editing Priority for {this.state.name}</h3></header>
                  <ul>
                    <li>
                      <div className={pclass('priority-box')}>
                        <label>Priority</label>
                        <input type="text" name="priority" valueLink={this.linkState('priority')} />
                      </div>
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
                  <header className={pclass('form-header')}><h3>Editing {this.state.name}</h3></header>
                  <ul>
                    <li>
                      <div className={pclass(['value-box', 'left'])}>
                        <label>{this.state.name}:</label>
                        <input type="text" name="value" valueLink={this.linkState('value')} />
                      </div>

                      <div className={pclass(['priority-box', 'right'])}>
                        <label>Priority</label>
                        <input type="text" name="priority" valueLink={this.linkState('priority')} />
                      </div>

                      <div className={pclass('clear')}></div>
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
                <header className={pclass('form-header')} >
                  <h3>Adding Child to <strong>{this.state.name}</strong> Node</h3>

                  <nav className={navClasses}>
                    <a className={pclass('form-nav-child')} onClick={this.addChildMode}>Add Child</a>
                    <a className={pclass('form-nav-branch')} onClick={this.addBranchMode}>Add Branch</a>
                    <a className={pclass('form-nav-json')} onClick={this.addJsonMode}>Add JSON</a>
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
                    <div className={pclass(['key-box', 'left'])}>
                      <label>Key</label>
                      <input  type="text" name="key" />
                    </div>

                    <div className={pclass(['value-box', 'left'])}>
                      <label>Value</label>
                      <input type="text" name="value"  />
                    </div>

                    <div className={pclass(['priority-box', 'right'])}>
                      <label>Priority</label>
                      <input type="text" name="priority"  />
                    </div>
                    <div className={pclass('clear')}></div>

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
                    <div className={pclass(['parent-box', 'left'])}>
                      <label>Parent Key</label>
                      <input  type="text" name="parentKey" />
                    </div>

                    <div className={pclass(['priority-box', 'left'])}>
                      <label>Priority</label>
                      <input type="text" name="parentPriority" />
                    </div>
                    <div className={pclass('clear')}></div>
                  </li>

                  <li>
                    <div className={pclass(['key-box', 'left'])}>
                      <label>Key</label>
                      <input  type="text" name="key" />
                    </div>

                    <div className={pclass(['value-box', 'left'])}>
                      <label>Value</label>
                      <input type="text" name="value"  />
                    </div>

                    <div className={pclass(['priority-box', 'right'])}>
                      <label>Priority</label>
                      <input type="text" name="priority"  />
                    </div>
                    <div className={pclass('clear')}></div>

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
                    <div className={pclass(['key-box', 'left'])}>
                      <label>Key</label>
                      <input  type="text" name="key" />
                    </div>

                    <div className={pclass(['priority-box', 'left'])}>
                      <label>Priority</label>
                      <input type="text" name="priority"  />
                    </div>
                    <div className={pclass('clear')}></div>
                  </li>
                  <li>
                    <div className={pclass('json-box')}>
                      <label>JSON</label>
                      <textarea name="json"></textarea>
                    </div>
                  </li>
                </ul>
              )
            }
          }.bind(this)()}

          <footer  className={pclass('form-footer')}>
            <input type="submit" value="Save"  className={pclass('button-primary')} />
            <a className={pclass('button-secondary')} onClick={this.closeForm}>Cancel</a>
          </footer>
        </form>
      </div>
    )
  }
});

