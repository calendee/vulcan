/** @jsx React.DOM */

/*! @license
* React v0.11.2
* React (with addons) v0.11.2
*
* Copyright 2013-2014 Facebook, Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
* @providesModule AutoFocusMixin
* @typechecks static-only
*/


/*! @license
*  grunt-react
*
*  Copyright (c) 2013 Eric Clemmons

* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:

* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.

* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

/*! @license
  Firebase Vulcan - License: https://www.firebase.com/terms/terms-of-service.html
*/

/*
* Import React Components
*
*/

var React = require('react/addons');
window.React = React;
var Wrapper = require('./components/container');


/*
* Initialize Method
*
*/

var initialize = function (options) {
  options = options || {};

  //CREATE DOM CONTAINER
  var container = document.createElement('div');
  container.id = 'vulcan';
  document.body.appendChild(container);

  // ADD REACT COMPONENT
  React.renderComponent(<Wrapper options={options} />, container);
};


/*
* Initialize Application
*
*/

if (chrome && chrome.devtools) {
  // LET DEV TOOLS INITIALIZE APP
  window.VULCAN = initialize;
}
else {
  // INITIALIZE IN BROWSER
  document.addEventListener('DOMContentLoaded', initialize);
}