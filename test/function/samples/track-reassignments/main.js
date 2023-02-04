import { patchEventTarget } from './patchEventTarget.js';

class EventTarget {
	addEventListener(callback) {
		callback();
	}
}
global.window = { EventTarget };

let patchCalled = false;
patchEventTarget(() => (patchCalled = true));
const target = new EventTarget();
target.addEventListener()

assert.ok(patchCalled, 'patch');
