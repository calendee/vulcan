var topics = {}, subUid = -1;

/*
* EVENT HUB
*
* A very simple event pub/sub event hub. This is used so that
* deeply nested nodes can render a form component efficiently
*/

module.exports = {
  /*
  * subscribe
  *
  * Subscribes to an event and executes the callback when
  * the event is published.
  */

  subscribe: function(topic, func) {
    if (!topics[topic]) {
      topics[topic] = [];
    }
    var token = (++subUid).toString();
    topics[topic].push({
      token: token,
      func: func
    });

    return token;
  },


  /*
  * publish
  *
  * Publishes an event that is picked up immediatly by any subscribers.
  */

  publish: function(topic, args) {
    if (!topics[topic]) {
      return false;
    }
    setTimeout(function() {
      var subscribers = topics[topic],
        len = subscribers ? subscribers.length : 0;

      while (len--) {
        subscribers[len].func(topic, args);
      }
    }, 0);

    return true;
  },


  /*
  * unsubscribe
  *
  * Unsubscribe from an event
  */

  unsubscribe: function(token) {
    for (var m in topics) {
      if (topics[m]) {
        for (var i = 0, j = topics[m].length; i < j; i++) {
          if (topics[m][i].token === token) {
            topics[m].splice(i, 1);
            return token;
          }
        }
      }
    }

    return false;
  }
};