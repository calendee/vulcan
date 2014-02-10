/*global chrome*/

chrome.devtools.panels.create('Firebase', 'images/icon.png', 'panes/index.html', function (extensionPanel) {

  var shownListener = function (panelWindow) {

    extensionPanel.onShown.removeListener(shownListener);

    // Initialize the app
    panelWindow.VULCAN({
      container: {
        pinned: {
          top: true,
          left: true,
          right: true,
          bottom: true
        }
      }
    });

  };

  extensionPanel.onShown.addListener(shownListener);

});
