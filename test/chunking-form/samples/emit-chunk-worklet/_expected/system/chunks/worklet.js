System.register(['./chunk.js'], function (exports, module) {
	'use strict';
	var size, color;
	return {
		setters: [function (module) {
			size = module.s;
			color = module.c;
		}],
		execute: function () {

			registerPaint(
				'vertical-lines',
				class {
					paint(ctx, geom) {
						for (let x = 0; x < geom.width / size; x++) {
							ctx.beginPath();
							ctx.fillStyle = color;
							ctx.rect(x * size, 0, 2, geom.height);
							ctx.fill();
						}
					}
				}
			);

		}
	};
});
