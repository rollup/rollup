'use strict';

var __chunk_1 = require('./chunk.js');

registerPaint(
	'vertical-lines',
	class {
		paint(ctx, geom) {
			for (let x = 0; x < geom.width / __chunk_1.size; x++) {
				ctx.beginPath();
				ctx.fillStyle = __chunk_1.color;
				ctx.rect(x * __chunk_1.size, 0, 2, geom.height);
				ctx.fill();
			}
		}
	}
);
