export function mount() {
	return import('./router.js').then(m => m.route());
}
