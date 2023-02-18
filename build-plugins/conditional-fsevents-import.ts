import MagicString from 'magic-string';
import type { Plugin } from 'rollup';

const FSEVENTS_REQUIRE = "require('fsevents')";
const REPLACEMENT = "require('../../../src/watch/fsevents-importer').getFsEvents()";

export default function conditionalFsEventsImport(): Plugin {
	let transformed = false;
	return {
		buildEnd(error) {
			if (!(error || transformed)) {
				throw new Error('Could not find "fsevents-handler.js", was the file renamed?');
			}
		},
		name: 'conditional-fs-events-import',
		transform(code, id) {
			if (id.endsWith('fsevents-handler.js')) {
				transformed = true;
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
