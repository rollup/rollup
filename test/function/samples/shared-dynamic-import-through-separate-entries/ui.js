export function loadSettings() {
	return import('./settings.js').then(m => m.run());
}
