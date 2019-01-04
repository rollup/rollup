if (1n > 0) {
	console.log('ok');
}

if (1n + 1n > 0) {
	console.log('ok');
}

if (1n ** 1n > 0) {
	console.log('ok');
}

const max = 2n**64n;
const min = -max;

export default function isSafe (int) {
	return min<=int && int<=max;
};
