'use strict';

var _config_js = require('./_config.js');
var assert = require('assert');
var externalModule = require('external-module');

assert.ok( _config_js.execute );
externalModule.method();
