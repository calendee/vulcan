/** @jsx React.DOM */
var React = require('react/addons');
var AppMixins = require('./mixins');
var EventHub = require('./eventhub');

/*
* EDIT NODE FORM COMPONENT
*
* This component is used to add and edit data for
* Firebase nodes.
*/

module.exports = React.createClass({
  mixins: [AppMixins, React.addons.LinkedStateMixin],


  /*
  * getInitialState
  *
  * The return value will be used as the initial value of this.state
  */

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

  /*
  * componentDidMount
  *
  * Invoked immediately after rendering occurs,
  * only on the client (not on the server).
  */

  componentDidMount: function() {
    this.refs.firstField.getDOMNode().focus();
  },


  /*
  * componentDidUpdate
  *
  * Invoked immediately after updating occurs.
  * This method is not called for the initial render.
  */

  componentDidUpdate: function() {
    this.refs.firstField.getDOMNode().focus();
  },


  /*
  * handleSubmit
  *
  * Handles the submit event for the form
  */

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


  /*
  * saveChildNode
  *
  * Method for creating a standard key/value child node
  */

  saveChildNode: function(form) {
    var key = form.key.value.trim();
    var value = form.value.value.trim();
    var priority = this.cleanPriority(form.priority.value);

    if(value && key) {
      this.state.firebaseRef.child(key).setWithPriority(value, priority, function(error) {
        if(error && error.code) {
          EventHub.publish('error', error.code);
        }
      });
    }
  },


  /*
  * saveBranchNode
  *
  * Method for creating a branch node
  */

  saveBranchNode: function(form) {
    var parentKey = form.parentKey.value.trim();
    var parentPriority = form.parentPriority.value.trim() || null;

    var key = form.key.value.trim();
    var value = form.value.value.trim();
    var priority = this.cleanPriority(form.priority.value);

    if(parentKey && key && value) {
      var childData = {};
      childData[key] = value;

      //CREATE PARENT WITH DATA AND PRIORITY
      this.state.firebaseRef.child(parentKey).setWithPriority(childData, parentPriority, function(error) {
        if(error && error.code) {
          EventHub.publish('error', error.code);
        }
        else {
          //UPDATE CHILD PRIORITY
          this.state.firebaseRef.child(parentKey).child(key).setPriority(priority, function(error) {
            if(error && error.code) {
              EventHub.publish('error', error.code);
            }
          });
        }

        this.closeForm();

      }.bind(this));
    }
  },


  /*
  * saveJsonNode
  *
  * Method for adding JSON data to a node
  */

  saveJsonNode: function(form) {
    var key = form.key.value.trim();
    var json = JSON.parse(form.json.value.trim());
    var priority = this.cleanPriority(form.priority.value);

    if(json && key) {
      this.state.firebaseRef.child(key).setWithPriority(json, priority, function(error) {
        if(error && error.code) {
          EventHub.publish('error', error.code);
        }
      });
      this.closeForm();
    }
  },


  /*
  * updateNode
  *
  * Updates the value for an existing node.
  */

  updateNode: function(form) {
    var priority = this.cleanPriority(form.priority.value);
    var value = form.value.value.trim();

    if(value !== undefined && value !== '') {
      this.state.firebaseRef.setWithPriority(value, priority, function(error) {
        if(error && error.code) {
          EventHub.publish('error', error.code);
        }
      });
      this.closeForm();
    }
  },


  /*
  * updatePriority
  *
  * Updates the priority for an existing node.
  */

  updatePriority: function(form){
    var priority = this.cleanPriority(form.priority.value);

    this.state.firebaseRef.setPriority(priority, function(error) {
      if(error && error.code) {
        EventHub.publish('error', error.code);
      }
    });
    this.closeForm();
  },


  /*
  * closeForm
  *
  * Cancels out the form and removes it from view
  * Changes to the form are lost.
  */

  closeForm: function(e) {
    if(e && e.preventDefault) {
      e.preventDefault();
    }
    this.props.onComplete();
  },


  /*
  * addChildMode
  *
  * Set the view mode for adding a child node
  */

  addChildMode: function() {
    this.setState({addMode: 'child'});
  },


  /*
  * addBranchMode
  *
  * Set the view mode for adding a branch
  */

  addBranchMode: function() {
    this.setState({addMode: 'branch'});
  },


  /*
  * addJsonMode
  *
  * Set the view mode for adding json
  */

  addJsonMode: function() {
    this.setState({addMode: 'json'});
  },


  /*
  * render
  *
  * When called, it should examine this.props and
  * this.state and return a single child component.
  */

  render: function() {
    var pclass = this.prefixClass;
    var cx = React.addons.classSet;


    //MODAL CLASS
    var modalClasses = cx({
      'modal': true,
      'is-devtools': this.props.isDevTools
    });
    modalClasses = modalClasses.concat([this.props.actio]);

    //NAV TAB CLASS
    var navClasses = cx({
      'modal-nav': true,
      'child-is-selected': this.state.addMode === 'child',
      'branch-is-selected': this.state.addMode === 'branch',
      'json-is-selected': this.state.addMode === 'json',
    });

    return (
      <div>
        <div className={pclass('overlay')}></div>
        <form onSubmit={this.handleSubmit} className={pclass(modalClasses)}>

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

