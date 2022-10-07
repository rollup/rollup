'use strict';

var _config_js = require('./_config.js');
var node_assert = require('node:assert');
var externalModule = require('external-module');

node_assert.ok( _config_js.execute );
externalModule.method();
