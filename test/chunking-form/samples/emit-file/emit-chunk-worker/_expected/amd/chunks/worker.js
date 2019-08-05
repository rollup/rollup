define(['./chunk'], function (shared) { 'use strict';

	postMessage(`from worker: ${shared.shared}`);

});
