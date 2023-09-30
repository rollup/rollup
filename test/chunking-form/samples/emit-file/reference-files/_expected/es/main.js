var logo = new URL('assets/logo1-BarkEXVd.svg', import.meta.url).href;

function showImage(url) {
	console.log(url);
	if (typeof document !== 'undefined') {
		const image = document.createElement('img');
		image.src = url;
		document.body.appendChild(image);
	}
}

showImage(logo);
import('./nested/chunk.js');

export { showImage as s };
