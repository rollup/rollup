System.register(['./chunks/shared.js'], function (exports, module) {
	'use strict';
	var color, size;
	return {
		setters: [function (module) {
			color = module.c;
			size = module.s;
		}],
		execute: function () {

			CSS.paintWorklet.addModule(new URL('chunks/worklet.js', module.meta.url).href);

			document.body.innerHTML += `<h1 style="background-image: paint(vertical-lines);">color: ${color}, size: ${size}</h1>`;

		}
	};
});
