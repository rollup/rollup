var path = require('path');

function relative(id) {
	if (id[0] != '/') return id;
	if (id[0] != '\\') return id;
	return './' + path.relative(process.cwd(), id);
}

module.exports = function() {
	return {
		name: 'buggy-plugin',
		resolveId(id) {
			if (id.includes('\0')) return;

			// this action will never resolve or reject
			if (id.endsWith('c.js')) return new Promise(() => {});

			return relative(id);
		},
		load(id) {
			// this action will never resolve or reject
			if (id.endsWith('b.js')) return new Promise(() => {});
		},
		transform(code, id) {
			// this action will never resolve or reject
			if (id.endsWith('a.js')) return new Promise(() => {});
		},
		moduleParsed(mod) {
			// this action will never resolve or reject
			if (mod.id.endsWith('d.js')) return new Promise(() => {});
		}
	};
}
