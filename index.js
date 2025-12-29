/* eslint-disable react/no-deprecated */
import React from 'react';
import PropTypes from 'prop-types';
import createClass from 'create-react-class';

import 'forpdi/css/animate.css';
import 'forpdi/css/html5-boilerplate/normalize.css';

if (!React.PropTypes) {
  React.PropTypes = PropTypes;
}
if (!React.createClass) {
  React.createClass = createClass;
}

require('forpdi/css/html5-boilerplate/main.css');
require('forpdi/sass/materialdesignicons/_materialdesignicons.scss');
require('forpdi/sass/_index.scss');
require('forpdi/css/html5-boilerplate/main.css');

require('forpdi/css/bootstrap.reset.css');
require('forpdi/css/daterangepicker.css');

require('jquery');
require('blueimp-file-upload/js/jquery.iframe-transport.js');
require('blueimp-file-upload');

require('bootstrap/dist/js/bootstrap.bundle');

require('forpdi/src/forpdi/vendor/daterangepicker.js');
require('forpdi/src/forpdi/vendor/FPDIRichText.jsx');
require('forpdi/src/AppSetup.jsx');
