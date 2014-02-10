module.exports = {
  prefixClass: function(name) {
    var prefix = 'forge-stealth';
    // Convert the name to an array
    if (!Array.isArray(name)) {
      name = name.split(' ');
    }
    return name.reduce(function(classString, className) {
      return classString + ' ' + prefix + '-' + className;
    }, '').replace(/^\s|\s$/g, '');
  }
};