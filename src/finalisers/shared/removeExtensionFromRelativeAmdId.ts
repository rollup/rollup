import removeJsExtension from './removeJsExtension';

// AMD resolution will only respect the AMD baseUrl if the .js extension is omitted.
// The assumption is that this makes sense for all relative ids:
// https://requirejs.org/docs/api.html#jsfiles
export default function removeExtensionFromRelativeAmdId(id: string) {
	return id[0] === '.' ? removeJsExtension(id) : id;
}
