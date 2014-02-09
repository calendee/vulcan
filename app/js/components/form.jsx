/** @jsx React.DOM */
var Transmitter = require('./transmitter');

module.exports = React.createClass({

  getInitialState: function() {
    return {
      mode: 'standard',
      key: '',
      nodeValue: '',
      parentKey: ''
    };
  },

  componentWillReceiveProps: function(nextProps) {
    console.log('props hit');
    if(nextProps.node) {
      var node = nextProps.node.state;
      var action = nextProps.action;
      var key = '';
      var nodeValue = '';
      var priority = '';

      if(action === 'edit') {
        key = node.name;
        nodeValue = node.value;
        priority = node.priority;
      }

      this.setState({
        key: key,
        nodeValue:  nodeValue,
        parentKey: '',
        priority: priority
      })
    }
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var form = e.currentTarget;
    var firebaseRef = this.props.node.props.firebaseRef;
    var key = form.key.value;
    var nodeValue = form.nodeValue.value;
    var priority = form.priority.value;

    firebaseRef.child(key).set(nodeValue);

    if(priority) {
      firebaseRef.child(key).setPriority(priority);
    }

    this.closeForm();
  },

  closeForm: function() {
    Transmitter.publish('closeForm');
  },

  prefixClass: function(name) {
    var prefix = 'forge-stealth';
    // Convert the name to an array
    if (!Array.isArray(name)) {
      name = name.split(' ');
    }
    return name.reduce(function(classString, className) {
      return classString + ' ' + prefix + '-' + className;
    }, '').replace(/^\s|\s$/g, '');
  },


  render: function() {
    var pclass = this.prefixClass;

    return (
      <div>
        <div className={pclass('form-overlay')}></div>
        <form onSubmit={this.handleSubmit} className={pclass(['form', this.props.action])}>
          <header className={pclass('form-header')}>
            <a>Value</a>
            <a>Child</a>
            <a>JSON</a>
          </header>

          {/* JSON FORM */}
          <div className={pclass(['form-body', this.state.mode])}>

            {/* STANDARD FORM */}
            <div className={pclass('form-standard')}>
              <div className="standard-row">
                <label>Key</label>
                <input  type="text" name="key" />

                <label>Value</label>
                <input type="text" name="nodeValue"  />
              </div>

              <div className="prio-row">
                <label>Prio</label>
                <input ref="priority" type="text" name="priority"  />
              </div>
            </div>

            {/* CHILD ADD FORM */}
            <div className={pclass('form-add-child')}>
              <div className="parent-row">
                <label>Key</label>
                <input type="text" name="parent-key" />
              </div>
              <div className="standard-row">
                <label>Child Key</label>
                <input type="text" name="child-key" />
                <label>Child Value</label>
                <input type="text" name="child-value" />
              </div>

              <div className="prio-row">
                <label>Prio</label>
                <input type="text" name="prio" />
              </div>
            </div>
          </div>

          <footer  className={pclass('form-footer')}>
            <input type="submit" value="Done"  className={pclass('form-submit')} />
            <a className={pclass('form-cancel')} onClick={this.closeForm}>Cancel</a>
          </footer>
        </form>
      </div>
    )
  }
});

