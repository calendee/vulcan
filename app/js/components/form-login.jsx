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
    var pclass = this.prefixClass;

    if(url) {
      this.props.onLogin({
        url: url,
        token: token
      });
    }
    else {
      this.refs.urlLabel.getDOMNode().innerHTML = 'Please enter your firebase URL';
      this.refs.urlLabel.getDOMNode().className = pclass('has-error');
    }
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
            <input  placeholder="Auth Token (optional)" ref="token" type="password" name="token"/>
          </li>
        </ul>

        <input type="submit" value="Sign In" className={pclass('button button-large button-primary')} />
      </form>
    )
  }
})