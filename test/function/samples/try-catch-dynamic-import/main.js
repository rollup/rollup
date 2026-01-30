export function test() {
	try {
		return import('./dep.js').then(n => n.value);
	} catch (error) {
		throw error;
	}
}
