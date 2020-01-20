import MagicString from 'magic-string';

const FSEVENTS_REQUIRE = "require('fsevents')";
const REPLACEMENT = "require('../../../src/watch/fsevents-importer').getFsEvents()";

export default function conditionalFsEventsImport() {
	return {
		name: 'conditional-fs-events-import',
		transform(code, id) {
			if (id.endsWith('fsevents-handler.js')) {
				const requireStatementPos = code.indexOf(FSEVENTS_REQUIRE);
				if (requireStatementPos < 0) {
					throw new Error(`Could not find expected fsevents import "${FSEVENTS_REQUIRE}"`);
				}
				const magicString = new MagicString(code);
				magicString.overwrite(
					requireStatementPos,
					requireStatementPos + FSEVENTS_REQUIRE.length,
					REPLACEMENT
				);
				return { code: magicString.toString(), map: magicString.generateMap({ hires: true }) };
			}
		}
	};
}
