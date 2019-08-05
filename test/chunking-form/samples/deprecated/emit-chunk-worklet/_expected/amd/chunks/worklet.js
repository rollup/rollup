define(['./chunk'], function (shared) { 'use strict';

	registerPaint(
		'vertical-lines',
		class {
			paint(ctx, geom) {
				for (let x = 0; x < geom.width / shared.size; x++) {
					ctx.beginPath();
					ctx.fillStyle = shared.color;
					ctx.rect(x * shared.size, 0, 2, geom.height);
					ctx.fill();
				}
			}
		}
	);

});
