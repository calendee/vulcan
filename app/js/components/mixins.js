module.exports = {
  cleanPriority: function(priority) {
    priority = priority.trim();

    //If priority is a number, return a real number
    if(!isNaN(priority) && priority !== '') {
      priority = Number(priority);
    }
    else {
      priority = priority || null;
    }

    return priority;
  },

  hasPriority: function(priority) {
    var hasPriority = false;

    //If priority is a number, return a real number

    if(priority === null || priority === undefined || priority === '') {
      hasPriority = false;
    }
    else {
      hasPriority = true;
    }

    return hasPriority;
  },

  prefixClass: function(name) {
    var prefix = 'vulcan';
    // Convert the name to an array
    if (!Array.isArray(name)) {
      name = name.split(' ');
    }
    return name.reduce(function(classString, className) {
      return classString + ' ' + prefix + '-' + className;
    }, '').replace(/^\s|\s$/g, '');
  }
};