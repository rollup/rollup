function parseInt(str, radix) {
	if (typeof str === 'symbol') {
		'' + str;
	}

	var string = trim(String(str));
	var defaultedRadix = $Number(radix) || (hexRegex.test(string) ? 16 : 10);
	return origParseInt(string, defaultedRadix);
}

console.log(parseInt('1'));
console.log(parseInt(Symbol('1')));
