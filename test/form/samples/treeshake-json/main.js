import { development, nested } from './config.json';

if (development) {
	console.log('development');
} else {
	console.log('production');
}

if (nested.specialConfig !== 1) {
	console.log('Nested data is not removed as long rollup-plugin-json creates "Literal" instead of "ObjectExpression" nodes');
}
