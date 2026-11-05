System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			module.import('./generated-button.js').then(({ default: button }) => console.log(button));
			module.import('./generated-other.js').then(({ default: other }) => console.log(other));
			module.import('./generated-single.js').then(({ name }) => console.log(name));
			module.import('./generated-index.js').then(({ default: withoutDirectory }) => console.log(withoutDirectory));

		})
	};
}));
