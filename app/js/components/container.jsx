/** @jsx React.DOM */
var AppHeader = require('./header');
var Root = require('./root');
var LoginForm = require('./form-login');
var EditForm = require('./form-edit');
var EventHub = require('./eventhub');
var AppMixins = require('./mixins');

module.exports = React.createClass({
  mixins: [AppMixins],

  getInitialState: function() {
    var options = (this.props.options && this.props.options.container) ? this.props.options.container : {};
    return {
      status: 'new',
      firebaseRef: null,
      url: '',
      token: '',
      formAction: null,
      node: null,
      pinned: options.pinned || {
        top: false,
        left: false,
        right: true,
        bottom: true
      }
    };
  },

  componentWillMount: function() {
    EventHub.subscribe('add', this.showForm);
    EventHub.subscribe('priority', this.showForm);
    EventHub.subscribe('edit', this.showForm);
  },

  showForm: function(name, node) {
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
    //CLEAR ERROR MESSAGES
    this.setState({loginError: null});

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
        this.setState({ loginError: error });
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

  collapseAll: function() {
    console.log('collapse');
    EventHub.publish('collapse');
  },

  expandAll: function() {
    console.log('expand');
    EventHub.publish('expand');
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
    console.log(action);

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
    var cx = React.addons.classSet;

    //OPTIONS FOR PINNING STATE
    var classes = cx({
      'forge-stealth-pinned-top': this.state.pinned.top,
      'forge-stealth-pinned-bottom': this.state.pinned.bottom,
      'forge-stealth-pinned-left': this.state.pinned.left,
      'forge-stealth-pinned-right': this.state.pinned.right,
      'forge-stealth-pinned-all': this.state.pinned.top && this.state.pinned.bottom && this.state.pinned.left && this.state.pinned.right,
      'forge-stealth-pinned': true
    });

    return (
      <div className={classes}>
        <AppHeader onHeaderAction={this.headerAction} url={this.state.url} showDropdown={false}/>

        <div className={pclass("body")} ref="appBody">
          {function(){
            if(this.state.firebaseRef) {
              return <Root firebaseRef={this.state.firebaseRef} />
            }
            else {
              return <LoginForm errors={this.state.loginError} onLogin={this.login} url="https://airwolfe.firebaseio.com/" />
            }
          }.bind(this)()}
        </div>


        {function(){
          if(this.state.firebaseRef && this.state.formAction){
            return <EditForm node={this.state.node} action={this.state.formAction} onComplete={this.closeForm} status="changed"/>
          }
        }.bind(this)()}
      </div>
    );
  }
});