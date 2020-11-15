// AMD resolution will only respect the AMD baseUrl if the .js extension is omitted.
// The assumption is that this makes sense for all relative ids:
// https://requirejs.org/docs/api.html#jsfiles
export default function removeExtensionFromRelativeAmdId(id: string) {
	if (id[0] === '.' && id.endsWith('.js')) {
		return id.slice(0, -3);
	}
	return id;
}
