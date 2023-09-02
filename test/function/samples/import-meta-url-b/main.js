export default function getUrl() {
	document.currentScript = { src: '' };
	return import.meta.url;
}
