export default function getUrl() {
	document.currentScript = { src: '' };
	const url = import.meta.url;
	assert.ok(import.meta.abc || true);
	return url;
}
