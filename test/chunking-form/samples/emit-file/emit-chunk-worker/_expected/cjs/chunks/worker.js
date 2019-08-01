'use strict';

var shared = require('./chunk.js');

postMessage(`from worker: ${shared.shared}`);
