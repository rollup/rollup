import logo from './logo.svg';
import logoReverse from "./logo_reverse'.svg"

function showImage(url) {
	console.log(url);
	if (typeof document !== 'undefined') {
		const image = document.createElement('img');
		image.src = url;
		document.body.appendChild(image);
	}
}

showImage(logo);
showImage(logoReverse);
