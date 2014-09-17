/** @jsx React.DOM */
var React = require('react/addons');
var AppMixins = require('./mixins');

//LOGIN FORM CLASS
module.exports = React.createClass({
  mixins: [AppMixins],

  handleSubmit: function(e) {
    e.preventDefault();
    var url = this.refs.url.getDOMNode().value.trim();
    var urlIsValid = this.validateURL(url);
    var token = this.refs.token.getDOMNode().value.trim();
    var pclass = this.prefixClass;

    if(urlIsValid) {
      this.props.onLogin({
        url: url,
        token: token
      });
    }
    else {
      this.refs.urlLabel.getDOMNode().innerHTML = 'Please enter a valid Firebase URL';
      this.refs.urlLabel.getDOMNode().className = pclass('has-error');
    }
  },

  validateURL: function(url) {
    var isValid = false;
    var isFirebaseURL = /^(https:\/\/)[a-zA-Z0-9-]+(.firebaseio.com)[\w\W]*/i;

    if(isFirebaseURL.test(url)) {
      isValid = true;
    }

    return isValid;
  },

  renderAuthLabel: function() {
    var pclass = this.prefixClass;
    var label = <label for="tokenField" ref="tokenLabel">Authentication Token <em>(optional, <a target="_blank" href="https://www.firebase.com/docs/web/guide/simple-login/custom.html">more info</a>)</em></label>


    if(this.props.authError) {
      label = <label for="tokenField" ref="tokenLabel" className={pclass('has-error')}>The Authentication Token is Invalid</label>
    }

    return label;
  },

  render: function() {
    var pclass = this.prefixClass;
    var cx = React.addons.classSet;


    //OPTIONS FOR PINNING STATE
    var classes = cx({
      'login-form': true,
      'is-devtools': this.props.isDevTools
    });

    var formClasses = cx({
      'form-fields': true,
      'l-stacked': true,
      'form-fields-large': !this.props.isDevTools
    });


    return  (
      <form onSubmit={this.handleSubmit} className={pclass(classes)}>
        <img className={pclass('logo-image')} src="images/vulcan-logo.png" />
        <h2 className={pclass('title')}>Vulcan</h2>
        <p className={pclass('sub-title')}>Firebase Data Inspector</p>

        <ul className={pclass(formClasses)}>
          <li>
            <label for="urlField" ref="urlLabel">Firebase URL</label>
            <input id="urlField" ref="url" placeholder="https://yourapp.firebaseio.com" type="text" name="url" defaultValue={this.props.url}/>
          </li>
          <li>
            {this.renderAuthLabel()}
            <input id="tokenField"  ref="token" type="password" name="token"/>
          </li>
        </ul>

        <input type="submit" value="Sign In" className={pclass('button button-large button-primary')} />
      </form>
    )
  }
})