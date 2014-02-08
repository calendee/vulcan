/** @jsx React.DOM */
module.exports = React.createClass({


  handleSubmit: function(e) {
    e.preventDefault();
    console.log('submitted');
  },

  render: function() {
    return (
      <form onSubmit={this.handleSubmit}>
        <header>
          <a>Value</a>
          <a>Child</a>
          <a>JSON</a>
        </header>

        <div>
          <label>Enter JSON</label>
          <textarea></textarea>
        </div>

        <div>
          <div className="standard-row">
            <label>Key</label>
            <input type="text" name="key" />
            <label>Value</label>
            <input type="text" name="value" />
          </div>

          <div className="prio-row">
            <label>Prio</label>
            <input type="text" name="prio" />
          </div>
        </div>

        <div>
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

        <footer>
          <input type="submit" value="Done" />
        </footer>
      </form>
    )
  }
});

