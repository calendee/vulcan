/** @jsx React.DOM */
var Tree = require('./tree');

module.exports = React.createClass({

  getInitialState: function() {
    return {
      status: 'new',
      ref: null,
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
            ref: firebase
          });
        }
      }.bind(this));
    }
    // STANDARD FIREBASE
    else {
      this.setState({
        url: url,
        ref: firebase
      });
    }
  },

  logout: function() {
    //UNAUTH USER
    this.state.ref.unauth();

    this.setState({
      url: '',
      token: '',
      ref: null,
      status: 'new'
    });
  },

  render: function() {
    return (
      <div>
        <header>
          <h1>Stealth</h1>
          <ul>
            <li><a onClick={this.logout}>Logout</a></li>
          </ul>
        </header>

        <div className="forge-stealth-body">
          {function(){
            if(this.state.ref) {
              return <Tree ref={this.state.ref} />
            }
            else  {
              return  (
              <form onSubmit={this.login}>
                <ul>
                  <li>
                    <label>Firebase URL</label>
                    <input type="text" name="url" value="https://airwolfe.firebaseio.com/"/>
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