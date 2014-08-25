/** @jsx React.DOM */
var React = require('react/addons');
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
      priority: node.props.priority,
      firebaseRef: node.props.firebaseRef,
      addMode: 'child' //child, branch, json
    };
  },

  componentDidMount: function() {
    this.refs.firstField.getDOMNode().focus();
  },

  componentDidUpdate: function() {
    this.refs.firstField.getDOMNode().focus();
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

  closeForm: function(e) {
    if(e && e.preventDefault) {
      e.preventDefault();
    }
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
      'modal-nav': true,
      'child-is-selected': this.state.addMode === 'child',
      'branch-is-selected': this.state.addMode === 'branch',
      'json-is-selected': this.state.addMode === 'json'
    });

    return (
      <div>
        <div className={pclass('overlay')}></div>
        <form onSubmit={this.handleSubmit} className={pclass(['modal', this.props.action])}>

          {function() {
            //EDIT PRIORITY
            if(this.props.action === 'priority') {
              return (
                <div>
                  <header className={pclass('modal-header')}><h3>Editing Priority for {this.state.name}</h3></header>
                  <div className={pclass('modal-body')}>
                    <ul className={pclass(['grid', 'form-fields', 'form-fields-small', 'l-stacked'])}>
                      <li className={pclass('clearfix')}>
                        <div className={pclass('25-percent')}>
                          <label>Priority</label>
                          <input ref="firstField" type="text" name="priority" valueLink={this.linkState('priority')} />
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              )
            }
          }.bind(this)()}


          {function() {
            //EDIT EXISTING NODE
            if(this.props.action === 'edit') {
              return (
                <div>
                  <header className={pclass('modal-header')}><h3>Editing {this.state.name}</h3></header>
                  <div className={pclass('modal-body')}>
                    <ul className={pclass(['grid', 'form-fields', 'form-fields-small', 'l-stacked'])}>
                      <li className={pclass('clearfix')}>
                        <div className={pclass('75-percent')}>
                          <label>{this.state.name}:</label>
                          <input ref="firstField" type="text" name="value" valueLink={this.linkState('value')} />
                        </div>

                        <div className={pclass('25-percent')}>
                          <label>Priority</label>
                          <input type="text" name="priority" valueLink={this.linkState('priority')} />
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              )
            }
          }.bind(this)()}


          {function() {
            //HEADER NAV
            if(this.props.action === 'add') {
              return (
                <header className={pclass('modal-header')} >
                  <h3>Adding Child to <strong>{this.state.name}</strong> Node</h3>

                  <nav className={pclass(navClasses)}>
                    <a className={pclass('modal-tab modal-tab-child')} onClick={this.addChildMode}>Add Child <i></i></a>
                    <a className={pclass('modal-tab modal-tab-branch')} onClick={this.addBranchMode}>Add Branch <i></i></a>
                    <a className={pclass('modal-tab modal-tab-json')} onClick={this.addJsonMode}>Add JSON <i></i></a>
                  </nav>
                </header>
              )
            }
          }.bind(this)()}


          {function() {
            //ADDING CHILD
            if(this.props.action === 'add' && this.state.addMode === 'child') {
              return (
                <div className={pclass('modal-body')}>
                  <ul className={pclass(['grid', 'form-fields', 'form-fields-small', 'l-stacked'])}>
                    <li>
                      <div className={pclass(['25-percent', 'left'])}>
                        <label>Key</label>
                        <input  ref="firstField" type="text" name="key" />
                      </div>

                      <div className={pclass(['50-percent', 'left'])}>
                        <label>Value</label>
                        <input type="text" name="value"  />
                      </div>

                      <div className={pclass(['25-percent', 'right'])}>
                        <label>Priority</label>
                        <input type="text" name="priority"  />
                      </div>
                    </li>
                </ul>
                </div>
              )
            }
          }.bind(this)()}


          {function() {
            //ADDING BRANCH
            if(this.props.action === 'add' && this.state.addMode === 'branch') {
              return (
                <div className={pclass('modal-body')}>
                  <ul className={pclass(['grid', 'form-fields', 'form-fields-small', 'l-stacked'])}>
                    <li className={pclass('clearfix')}>
                      <div className={pclass('25-percent')}>
                        <label>Parent Key</label>
                        <input  ref="firstField" type="text" name="parentKey" />
                      </div>

                      <div className={pclass('25-percent')}>
                        <label>Priority</label>
                        <input type="text" name="parentPriority" />
                      </div>
                    </li>

                    <li className={pclass('clearfix')}>
                      <div className={pclass('25-percent')}>
                        <label>Key</label>
                        <input  type="text" name="key" />
                      </div>

                      <div className={pclass('50-percent')}>
                        <label>Value</label>
                        <input type="text" name="value"  />
                      </div>

                      <div className={pclass('25-percent')}>
                        <label>Priority</label>
                        <input type="text" name="priority"  />
                      </div>
                    </li>
                  </ul>
                </div>
              )
            }
          }.bind(this)()}


          {function() {
            //ADDING JSON
            if(this.props.action === 'add' && this.state.addMode === 'json') {
              return (
                <div className={pclass('modal-body')}>
                  <ul className={pclass(['grid', 'form-fields', 'form-fields-small', 'l-stacked'])}>
                    <li className={pclass('clearfix')}>
                      <div className={pclass('25-percent')}>
                        <label>Key</label>
                        <input  ref="firstField" type="text" name="key" />
                      </div>

                      <div className={pclass('25-percent')}>
                        <label>Priority</label>
                        <input type="text" name="priority"  />
                      </div>
                      <div className={pclass('clear')}></div>
                    </li>
                    <li className={pclass('clearfix')}>
                      <div className={pclass('100-percent')}>
                        <label>JSON</label>
                        <textarea name="json"></textarea>
                      </div>
                    </li>
                  </ul>
                </div>
              )
            }
          }.bind(this)()}

          <footer  className={pclass('modal-footer')}>
            <input type="submit" value="Save"  className={pclass('button button-primary l-pad-right')} />
            <button className={pclass('button button-secondary')} onClick={this.closeForm}>Cancel</button>
          </footer>
        </form>
      </div>
    )
  }
});

