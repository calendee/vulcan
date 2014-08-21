/** @jsx React.DOM */
var React = require('react/addons');
var AppMixins = require('./mixins');

//LOGIN FORM CLASS
module.exports = React.createClass({
  mixins: [AppMixins],

  handleSubmit: function(e) {
    e.preventDefault();
    var url = this.refs.url.getDOMNode().value.trim();
    var token = this.refs.token.getDOMNode().value.trim();

    if(url) {
      this.props.onLogin({
        url: url,
        token: token
      });
    }
    else {
      this.refs.urlLabel.getDOMNode().innerHTML = 'Please enter your firebase URL';
    }
  },

  render: function() {
    var pclass = this.prefixClass;
    var alert = this.props.errors ? <div class="alert alert-error">{this.props.errors.message}</div> : '';

    return  (
      <form onSubmit={this.handleSubmit} className={pclass('login-form')}>
        <h2 class="title">Vulcan</h2>
        <p class="sub-title">Firebase Data Inspector</p>

        {alert}

        <ul className={pclass(['form-fields', 'l-stacked'])}>
          <li>
            <label ref="urlLabel">Firebase URL</label>
            <input ref="url" type="text" name="url" defaultValue={this.props.url}/>
          </li>
          <li>
            <label>Auth Token <em>(optional)</em></label>
            <input ref="token" type="password" name="token"/>
          </li>
        </ul>

        <input type="submit" value="Sign In" className={pclass('button button-large button-primary')} />
      </form>
    )
  }
})