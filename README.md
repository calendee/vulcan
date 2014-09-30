# Vulcan - Firebase Data Inspector
Vulcan is a powerful tool for inspecting and manipulating your Firebase data directly from the Browser or Chrome DevTools.

## Drop Vulcan into a web page
Vulcan can be used as plugin on your web page by simply including the script tags and css dependancies:

```
  <link rel="stylesheet" type="text/css" href="css/vulcan.css">
  <script src="https://cdn.firebase.com/js/client/1.0.24/firebase.js"></script>
  <script type="text/javascript" src="js/vulcan.js"></script>
```

## Vulcan Chrome Plugin
To use Vulcan as a chrome plugin during development:

1. Go to settings in your browser
2. Navigate to Extensions
3. Check Developer mode
4. Click the Load unpacked extension... button
5. Select the chrome-extension directory
6. Open your dev tools
7. You should now have a Firebase tab

The production version of Vulcan is also available in the [Chrome Store](https://chrome.google.com/webstore/detail/vulcan-by-firebase/oippbnlmebalopjbkemajgfbglcjhnbl?utm_source=chrome-ntp-icon)


## Development
We use grunt for our build process. You can use the following commands:

- **grunt dev** - Builds the web and chrome extension in development mode and runs the demo on http://localhost:8000. All changes are processed automatically and live reloaded. The files in this mode are not compressed or uglified in order to make development easier.
- **grunt** - Builds the web and chrome extension in production ready mode. The files produced with this command are minified and uglified in order to optimize performance.


## License
MIT - http://firebase.mit-license.org
