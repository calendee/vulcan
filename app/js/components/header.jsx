/** @jsx React.DOM */
var React = require('react/addons');
var AppMixins = require('./mixins');

/*
* APP HEADER COMPONENT
*
* The header and toolbar for the vulcan app
*/

module.exports = React.createClass({
  mixins: [AppMixins],

  /*
  * getInitialState
  *
  * The return value will be used as the initial value of this.state
  */

  getInitialState: function() {
    return {showDropdown: this.props.showDropdown};
  },


  /*
  * componentWillReceiveProps
  *
  * Invoked when a component is receiving new props.
  * This method is not called for the initial render.
  */

  componentWillReceiveProps: function() {
    this.setState({showDropdown: this.props.showDropdown});
  },


  /*
  * minimize
  *
  * Minimizes the application so only the header is visible
  * in the browser app
  */

  minimize: function(e) {
    e.preventDefault();
    this.props.onHeaderAction({type: 'minimize'});
  },


  /*
  * expand
  *
  * Expands the entire node tree so all nodes are visible
  */

  expand: function(e) {
    e.preventDefault();
    this.props.onHeaderAction({type: 'expand'});
  },


  /*
  * collapse
  *
  * Collapses the entire node tree so only the root node
  * and its immediate children are visible
  */

  collapse: function(e) {
    e.preventDefault();
    this.props.onHeaderAction({type: 'collapse'});
  },


  /*
  * logout
  *
  * Logs out of the current Firebase URL Ref and takes
  * the user to the Vulcan start screen
  */

  logout: function(e) {
    e.preventDefault();
    this.props.onHeaderAction({type: 'logout'});
  },


  /*
  * toggleDropdown
  *
  * toggles the dropdown menu in and out of view
  */

  toggleDropdown: function(e) {
    e.preventDefault();

    if (this.props.checkStateOfParent("minimized")){
      // toggle state
      this.props.setStateOfParent("minimized", !this.props.checkStateOfParent("minimized"));
    } else {
      this.setState({showDropdown: !this.state.showDropdown})
    }
  },


  /*
  * handleSubmit
  *
  * Handles the submit event for the Firebase URL field in the header
  */

  handleSubmit: function(e) {
    e.preventDefault();
    var field = this.refs.url.getDOMNode();
    var url = field.value.trim();

    if(url) {
      this.props.onHeaderAction({
        type: 'url',
        url: url
      });

      field.blur();
    }
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

    //OPTIONS FOR PINNING STATE
    var classes = cx({
      'toolbar': true,
      'is-devtools': this.props.isDevTools
    });

    return (
      <div className={pclass(classes)}>

        <div className={pclass('toolbar-start')}>
          <h1 className={pclass('logo')}>V</h1>
        </div>

        {function(){
          if(this.props.url) {
            return (
              <form onSubmit={this.handleSubmit}>
                <input className={pclass("toolbar-url")} type="text" defaultValue={this.props.url} ref="url" />

                <div className={pclass('toolbar-end')} onClick={this.toggleDropdown}>
                  <a href="#" className={pclass('toolbar-arrow')}></a>

                  {function(){
                    if(this.state.showDropdown) {
                      return (
                        <ul className={pclass('dropdown')}>
                          {function(){
                            // if not in dev tools, show minimize option
                            if (!this.props.isDevTools) {
                              return (
                                <li><a href="#" onClick={this.minimize}>Minimize</a></li>
                              )
                            }
                          }.bind(this)()}
                          <li><a href="#" onClick={this.expand}>Expand All</a></li>
                          <li><a href="#" onClick={this.collapse}>Collapse All</a></li>
                          <li><a href="#" onClick={this.logout}>Logout</a></li>
                        </ul>
                      )
                    }
                  }.bind(this)()}
                </div>
              </form>
            )
          }
          else {
            //show alt here
          }
        }.bind(this)()}
      </div>
    )
  }
});
