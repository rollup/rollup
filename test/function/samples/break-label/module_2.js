export let value = 'original';

export function n() {
	n: if (value === 1) {
		break n;
		value = 'changed';
	}
}
