/** @jsx React.DOM */
var React = require('react/addons');
var AppHeader = require('./header');
var Root = require('./root');
var LoginForm = require('./form-login');
var EditForm = require('./form-edit');
var EventHub = require('./eventhub');
var AppMixins = require('./mixins');

var errorMessages = {
  PERMISSION_DENIED: 'You do not have permission to edit data at this location.',
  PERMISSION_DENIED_READ: 'You do not have permission to view this Firebase.',
  INVALID_TOKEN: 'The token you entered is not valid.'
};

/*
* BASE CONTAINER ELEMENT
*
* This component is the wrapper for the entire application
*/

module.exports = React.createClass({
  mixins: [AppMixins],

  /*
  * getInitialState
  *
  * The return value will be used as the initial value of this.state
  */

  getInitialState: function() {
    //Check if running Vulcan in Chrome Dev Tools Panel
    var isDevTools = (this.props.options && this.props.options.isDevTools) ? true: false;

    // Default pinning options
    var pinnedOptions = {
      top: false,
      left: false,
      right: true,
      bottom: true
    }

    // Pin to all 4 sides for dev tools
    if(isDevTools) {
      pinnedOptions = {
        top: true,
        left: true,
        right: true,
        bottom: true
      }
    }

    return {
      status: 'new',
      firebaseRef: null,
      url: '',
      token: '',
      formAction: null,
      node: null,
      loginAuthError: '',
      minimized: false,
      pinned: pinnedOptions,
      isDevTools: isDevTools
    };
  },


  /*
  * componentWillMount
  *
  * Invoked once, both on the client and server,
  * immediately before the initial rendering occurs.
  */

  componentWillMount: function() {
    //SUBSCRIBE TO EVENTS
    EventHub.subscribe('add', this.showForm);
    EventHub.subscribe('priority', this.showForm);
    EventHub.subscribe('edit', this.showForm);
    EventHub.subscribe('error', this.showError);
    EventHub.subscribe('reset', this.resetApp);
  },


  /*
  * showForm
  *
  * Show the add or edit form
  */

  showForm: function(name, node) {
    this.setState({
      formAction: name,
      node: node
    });
  },


  /*
  * closeForm
  *
  * Hide the add or edit form
  */

  closeForm: function() {
    this.setState({
      formAction: null,
      node: null
    });
  },


  /*
  * showError
  *
  * Display error message to user
  */

  showError: function(event, error) {
    var message = errorMessages[error] || 'Sorry there was a problem with your request';

    this.setState({
      error: message
    });
  },


  /*
  * hideError
  *
  * Hide the error message
  */

  hideError: function(e) {
    if(e && e.preventDefault) {
      e.preventDefault();
    }

    this.setState({error: ''});
  },


  /*
  * resetApp
  *
  * Reset application by removing all previous state info.
  */

  resetApp: function(event, error) {
    this.setState({
      status: 'new',
      firebaseRef: null,
      url: '',
      token: '',
      formAction: null,
      node: null,
      loginAuthError: '',
      minimized: false,
    });

    if(error && error === 'PERMISSION_DENIED') {
      this.showError(null, 'PERMISSION_DENIED_READ');
    }
  },


  /*
  * login
  *
  * Intialize the login for the Firebase URL and
  * Auth Token the user has provided.
  */

  login: function(data) {
    //CLEAR ERROR MESSAGES
    this.setState({loginAuthError: null});

    var firebase = new Firebase(data.url);
    var token = data.token || this.state.token;

    //AUTHENTICATE
    if(token) {
      this.authenticate(firebase, token, data.url);
    }
    else {
      this.setState({url: data.url, firebaseRef: firebase});
    }
  },


  /*
  * logout
  *
  * Log a user out of the current Firebase and return them
  * to the login screen.
  */

  logout: function() {
    //UNAUTHENTICATE
    this.state.firebaseRef.unauth();

    this.setState({
      formAction: null,
      node: null,
      status: 'new',
      firebaseRef: null,
      url: '',
      token: ''
    });
  },


  /*
  * authenticate
  *
  * Authenticate the Firebase with a token
  */

  authenticate: function(firebase, token, url) {
    firebase.auth(token, function(error, result) {
      if(error && error.code) {
        this.setState({ loginAuthError: error.code });
      }
      else {
        this.setState({
          url: url,
          token: token,
          firebaseRef: firebase
        });
      }
    }.bind(this));
  },


  /*
  * minimize
  *
  * Minimize the application. This method is used only when
  * Vulcan is injected into a web page.
  */

  minimize: function() {
    if (!this.state.minimized){
      this.toggleHide();
    }
  },


  /*
  * toggleHide
  *
  * Toggle the hide/show state for the app
  */

  toggleHide: function(){
    this.setState({minimized: !this.state.minimized});
  },


  /*
  * collapseAll
  *
  * Trigger the collapse all event for nodes. Once this is
  * triggered only the root node and immediate children will
  * be displayed in the DOM
  */

  collapseAll: function() {
    EventHub.publish('collapseAll');
  },


  /*
  * expandAll
  *
  * Trigger the expand all event for nodes. Once this is
  * triggered all nodes in the Firebase will be fully displayed.
  */

  expandAll: function() {
    EventHub.publish('expandAll');
  },


  /*
  * changeURL
  *
  * Change the application to display the contents of a new
  * Firebase URL.
  */

  changeURL: function(data) {
    var firebase = new Firebase(data.url);

    //RESET
    this.setState({
      formAction: null,
      node: null,
      status: 'new',
      firebaseRef: null,
      url: '',
      token: '',
      error: ''
    },
    function() {
      //USE NEW FIREBASE REF
      this.setState({
        url: data.url,
        firebaseRef: firebase
      });
    }.bind(this));
  },


  /*
  * headerAction
  *
  * A map of the different methods to call when the header
  * of the app triggers and action.
  */

  headerAction: function(action) {
    switch(action.type) {
      case 'minimize':  this.minimize();                 break;
      case 'collapse':  this.collapseAll();              break;
      case 'expand':    this.expandAll();                break;
      case 'logout':    this.logout();                   break;
      case 'url':       this.changeURL(action);          break;
    }
  },


  /*
  * renderErrorMessage
  *
  * Returns an error message if the current state has an error.
  */

  renderErrorMessage: function() {
    var pclass = this.prefixClass;
    var message = '';

    if(this.state.error) {
      message = (
        <div className={pclass(['alert', 'alert-error'])}>
          {this.state.error}
          <a href="#" onClick={this.hideError} className={pclass('alert-close')}>x</a>
        </div>
      );
    }

    return message;
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

    // compute classes for app body including show/hide
    var computeClasses = function(){

      var classes = "";
      if (this.state.minimized) {
        classes += "hide ";
      }

      classes += pclass("app-body");
      return classes;

    }.bind(this);

    var checkStateOfParent = function(stateKey){
      return (this.state[stateKey]);
    }.bind(this);

    var setStateOfParent = function(stateKey, val){
      var newState = {};
      newState[stateKey] = val;
      this.setState(newState);
    }.bind(this);

    //OPTIONS FOR PINNING STATE
    var classes = cx({
      'l-pinned-top': this.state.pinned.top,
      'l-pinned-bottom': this.state.pinned.bottom,
      'l-pinned-left': this.state.pinned.left,
      'l-pinned-right': this.state.pinned.right,
      'l-pinned-all': this.state.pinned.top && this.state.pinned.bottom && this.state.pinned.left && this.state.pinned.right,
      'l-pinned': true,
      'app-container':true,
      'is-devtools': this.state.isDevTools
    });

    return (
      <div className={pclass(classes)}>
        <AppHeader onHeaderAction={this.headerAction} isDevTools={this.state.isDevTools} url={this.state.url} showDropdown={false} checkStateOfParent={checkStateOfParent} setStateOfParent={setStateOfParent} />

        <div className={computeClasses()} ref="appBody">
          {this.renderErrorMessage()}

          {function(){
            if(this.state.firebaseRef) {
              return <Root firebaseRef={this.state.firebaseRef} />
            }
            else {
              return (
                <div>
                  <LoginForm authError={this.state.loginAuthError} isDevTools={this.state.isDevTools} onLogin={this.login} />
                  <a className={pclass("badge")} href="https://www.firebase.com/" target="_blank">Firebase Inc.</a>
                </div>
              );
            }
          }.bind(this)()}
        </div>


        {function(){
          if(this.state.firebaseRef && this.state.formAction){
            return <EditForm node={this.state.node} isDevTools={this.state.isDevTools} action={this.state.formAction} onComplete={this.closeForm} status="changed"/>
          }
        }.bind(this)()}

      </div>
    );
  }
});
