const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_DEP = path.join(__dirname, 'dep.js');

module.exports = defineTest({
	description: 'throws for source phase imports',
	verifyAst: false,
	error: {
		code: 'NO_SOURCE_PHASE_HOOK',
		message: `No "sourcePhase" plugin hook is provided, unable to inline source phase import \`import source from "${ID_DEP}"\` for rollup.
Either treat it as an external or use a plugin that supports source phase imports.`,
		watchFiles: [ID_DEP, ID_MAIN]
	}
});
