/** @jsx React.DOM */
var AppHeader = require('./header');
var Node = require('./node');
var LoginForm = require('./form-login');
var EditForm = require('./form-edit');
var EventHub = require('./eventhub');
var AppMixins = require('./mixins');

module.exports = React.createClass({
  mixins: [AppMixins],

  getInitialState: function() {
    return {
      status: 'new',
      firebaseRef: null,
      url: '',
      token: '',
      formAction: null,
      node: null
    };
  },

  componentWillMount: function() {
    EventHub.subscribe('add', this.addNode);
    EventHub.subscribe('edit', this.editNode);
  },

  editNode: function(name, node) {
    this.setState({
      formAction: name,
      node: node
    });
  },

  addNode: function(name, node) {
    this.setState({
      formAction: name,
      node: node
    });
  },

  closeForm: function() {
    this.setState({
      formAction: null,
      node: null
    });
  },

  login: function(data) {
    var firebase = new Firebase(data.url);
    var token = data.token || this.state.token;

    //AUTHENTICATE
    if(token) {
      this.authenticate(firebase, token);
    }
    else {
      this.setState({url: data.url, firebaseRef: firebase });
    }
  },

  authenticate: function(firebase, token) {
    firebase.auth(token, function(error, result) {
      if(error) {
        this.setState({ status: 'error' });
      }
      else {
        this.setState({
          url: data.url,
          token: token,
          firebaseRef: firebase
        });
      }
    }.bind(this));
  },

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

  changeURL: function(data) {
    var firebase = new Firebase(data.url);

    //RESET
    this.setState({
      formAction: null,
      node: null,
      status: 'new',
      firebaseRef: null,
      url: '',
      token: ''
    },
    function() {
      //USE NEW FIREBASE REF
      this.setState({
        url: data.url,
        firebaseRef: firebase
      });
    }.bind(this));
  },

  headerAction: function(action) {
    switch(action.type) {
      case 'minimize':  this.minimize();                 break;
      case 'collapse':  this.collapseAll();              break;
      case 'expand':    this.expandAll();                break;
      case 'logout':    this.logout();                   break;
      case 'url':       this.changeURL(action);          break;
    }
  },

  render: function() {
    var pclass = this.prefixClass;

    return (
      <div>
        <AppHeader onHeaderAction={this.headerAction} url={this.state.url} showDropdown={false}/>

        <div className={pclass("body")} ref="appBody">
          {function(){
            if(this.state.firebaseRef) {
              return (
                <ul className={pclass("root-list")}>
                  <Node root={true} firebaseRef={this.state.firebaseRef} status="normal" />
                </ul>
              )
            }
            else {
              return <LoginForm onLogin={this.login} url="https://airwolfe.firebaseio.com/" />
            }
          }.bind(this)()}
        </div>


        {function(){
          if(this.state.firebaseRef && this.state.formAction){
            return <EditForm node={this.state.node} action={this.state.formAction} onComplete={this.closeForm} />
          }
        }.bind(this)()}
      </div>
    );
  }
});