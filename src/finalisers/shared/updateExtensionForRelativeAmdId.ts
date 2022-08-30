import addJsExtension from './addJsExtension';
import removeJsExtension from './removeJsExtension';

// AMD resolution will only respect the AMD baseUrl if the .js extension is omitted.
// The assumption is that this makes sense for all relative ids:
// https://requirejs.org/docs/api.html#jsfiles
export default function updateExtensionForRelativeAmdId(
	id: string,
	forceJsExtensionForImports: boolean
): string {
	if (id[0] !== '.') {
		return id;
	}

	return forceJsExtensionForImports ? addJsExtension(id) : removeJsExtension(id);
}
