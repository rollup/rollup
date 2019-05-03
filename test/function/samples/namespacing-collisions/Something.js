import * as Material from './Material';

export function Something() {
	assert.strictEqual(Material.Material(), 'Material');
	return 'Something';
}
