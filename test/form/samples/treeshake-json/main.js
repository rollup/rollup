import { production, nested } from './config.json';

if (production) {
	console.log('production');
} else {
	console.log('development');
}

if (nested.specialConfig !== 1) {
	console.log('Nested data is not removed as long rollup-plugin-json creates "Literal" instead of "ObjectExpression" nodes');
}
