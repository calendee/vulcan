/** @jsx React.DOM */

//LOGIN FORM CLASS

module.exports = React.createClass({

  handleSubmit: function(e) {
    e.preventDefault();
    var url = this.refs.url.getDOMNode().value.trim();
    var token = this.refs.token.getDOMNode().value.trim();

    console.log(url);

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
    return  (
      <form onSubmit={this.handleSubmit}>
        <h2>Vulcan</h2>
        <p>The Firebase Data Inspector</p>

        <ul>
          <li>
            <label ref="urlLabel">Firebase URL</label>
            <input ref="url" type="text" name="url" defaultValue={this.props.url}/>
          </li>
          <li>
            <label>Auth Token <em>(optional)</em></label>
            <input ref="token" type="password" name="token"/>
          </li>
        </ul>

        <input type="submit" value="Submit"/>
      </form>
    )
  }
})