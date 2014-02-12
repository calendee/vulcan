# Vulcan - Firebase Data Inspector

## Browser Plugin
Vulcan can be used as plugin on your web page by simply including the script tags and css dependancies:

```
<link rel="stylesheet" type="text/css" href="css/app.css">
<script type="text/javascript" src="bower_components/firebase/firebase.js"></script>
<script type="text/javascript" src="bower_components/react/react-with-addons.js"></script>
<script type="text/javascript" src="js/app.js"></script>
```

## Chrome Plugin
To use Vulcan as a chrom plugin:

1. Go to settings in your browser
2. Navigate to Extensions
3. Check Developer mode
4. Click the Load unpacked extension... button
5. Select the chrome-extension directory
6. Open your dev tools
7. You should now have a Firebase tab


## Development
We use grunt for our build process. You can use the following commmands:

- **grunt server** - builds the web environment and runs the server on localhost:8000 with live reload.
- **grunt** - builds both web and chrome extension production ready files.