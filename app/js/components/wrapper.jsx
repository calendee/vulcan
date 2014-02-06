/** @jsx React.DOM */
var Tree = require('./tree');

module.exports = React.createClass({

  getInitialState: function() {
    return {
      status: 'new',
      firebaseRef: null,
      url: '',
      token: ''
    };
  },

  login: function(event) {
    event.preventDefault();

    var form = event.currentTarget;
    var url = form.url.value;
    var token = form.token.value;
    var firebase = new Firebase(form.url.value);

    //LOADING
    this.setState({ status: 'loading' });

    //AUTHENTICATED FIREBASE
    if(form.token.value) {
      firebase.auth(token, function(error, result) {
        if(error) {
          this.setState({ status: 'error' });
        }
        else {
          this.setState({
            url: url,
            token: token,
            firebaseRef: firebase
          });
        }
      }.bind(this));
    }
    // STANDARD FIREBASE
    else {
      this.setState({
        url: url,
        firebaseRef: firebase
      });
    }
  },

  logout: function() {
    //UNAUTH USER
    this.state.firebaseRef.unauth();

    this.setState({
      url: '',
      token: '',
      firebaseRef: null,
      status: 'new'
    });
  },

  render: function() {
    return (
      <div>
        <div className="forge-stealth-header">
          <h1>Stealth</h1>

          {function(){
            if(this.state.firebaseRef) {
              return (
                <form className="forge-stealth-header-extras">
                  <input type="text" defaultValue={this.state.firebaseRef.toString()} />

                  <ul className="forge-stealth-dropdown">
                    <li><a onClick={this.logout}>Logout</a></li>
                  </ul>
                </form>
              )
            }
          }.bind(this)()}
        </div>

        <div className="forge-stealth-body">
          {function(){
            if(this.state.firebaseRef) {
              return <Tree firebaseRef={this.state.firebaseRef} />
            }
            else  {
              return  (
              <form onSubmit={this.login}>
                <ul>
                  <li>
                    <label>Firebase URL</label>
                    <input type="text" name="url" defaultValue="https://airwolfe.firebaseio.com/"/>
                  </li>
                  <li>
                    <label>Auth Token</label>
                    <input type="password" name="token"/>
                  </li>
                </ul>

                <input type="submit" value="Submit"/>
              </form>
              )
            }
          }.bind(this)()}
        </div>
      </div>
    );
  }

});