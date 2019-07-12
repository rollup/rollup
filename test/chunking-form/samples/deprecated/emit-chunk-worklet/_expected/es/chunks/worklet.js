import { s as size, c as color } from './chunk.js';

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
