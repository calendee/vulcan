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
    var cx = React.addons.classSet;
    var alert = this.props.errors ? <div class="alert alert-error">{this.props.errors.message}</div> : '';


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
        <h2 className={pclass('title')}>Vulcan</h2>
        <p className={pclass('sub-title')}>Firebase Data Inspector</p>

        {alert}

        <ul className={pclass(formClasses)}>
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