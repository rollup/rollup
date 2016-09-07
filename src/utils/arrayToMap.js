export function arrayToMap (list) {
	return list.reduce((accum, el) => {
		accum[el] = el;
		return accum;
	}, {});
}
