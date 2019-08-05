'use strict';

var shared = require('./shared.js');

postMessage(`from worker: ${shared.shared}`);
