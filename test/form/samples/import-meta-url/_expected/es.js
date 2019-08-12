function log(url) {
	if (typeof document === 'undefined') {
		console.log(url);
	} else {
		document.body.innerText = url;
	}
}

log(import.meta.url);
