# Vulcan - Firebase Data Inspector
Vulcan is a powerful tool for inspecting and manipulating your Firebase data directly from the Browser or Chrome DevTools.

## Drop Vulcan into a web page
Vulcan can be used as plugin on your web page by simply including the script tags and css dependancies:

```
  <link rel="stylesheet" type="text/css" href="css/vulcan.css">
  <script src="https://cdn.firebase.com/js/client/1.0.21/firebase.js"></script>
  <script type="text/javascript" src="js/vulcan.js"></script>
```

## Vulcan Chrome Plugin
To use Vulcan as a chrome plugin:

1. Go to settings in your browser
2. Navigate to Extensions
3. Check Developer mode
4. Click the Load unpacked extension... button
5. Select the chrome-extension directory
6. Open your dev tools
7. You should now have a Firebase tab

Vulcan is also available in the [Chrome Store](https://chrome.google.com/webstore/detail/vulcan-by-firebase/oippbnlmebalopjbkemajgfbglcjhnbl?utm_source=chrome-ntp-icon)



## Development
We use grunt for our build process. You can use the following commands:

- **grunt dev** - Runs the demo on http://localhost:8000 and listens for changes.
- **grunt** - builds both web and chrome extension production ready files.