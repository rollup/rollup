import { production, nested } from './config.json';

if (production) {
	console.log('production');
} else {
	console.log('development');
}

if (nested.specialConfig !== 1) {
	console.log('removed');
}
