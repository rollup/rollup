const assert = require('node:assert/strict');

const modules = {
	'main.js': "export const done = import('./host.js').then(module => module.mount());",
	'preview.js': "import('./preview-host.js').then(module => module.mount());",
	'host.js': `
		import { shared } from './shared.js';
		export async function mount() {
			shared();
			await import('./settings.js').then(module => module.run());
		}
	`,
	'preview-host.js': `
		export function mount() {
			return import('./router.js').then(module => module.route());
		}
	`,
	'router.js': `
		export async function route() {
			recordRouterLoad();
			if (false) await import('./settings.js').then(module => module.run());
		}
	`,
	'shared.js': 'export function shared() { recordSharedLoad(); }',
	'settings.js': `
		import { shared } from './shared.js';
		export function run() { shared(); }
	`
};

module.exports = defineTest({
	description: 'keeps a shared dependency with its host when a later import is tree-shaken',
	options: {
		input: ['main.js', 'preview.js'],
		plugins: [
			{
				name: 'virtual-entries',
				resolveId(id) {
					return id.replace(/^\.\//, '');
				},
				load(id) {
					return modules[id];
				},
				generateBundle(_options, bundle) {
					const host = Object.values(bundle).find(
						chunk => chunk.type === 'chunk' && chunk.moduleIds.includes('host.js')
					);
					assert.ok(host);
					assert.ok(host.moduleIds.includes('shared.js'), 'shared must stay in the host chunk');
				}
			}
		]
	},
	context: {
		recordSharedLoad() {}
	},
	async exports({ done }) {
		await done;
	}
});
