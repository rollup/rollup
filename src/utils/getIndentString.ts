export default function getIndentString (magicString, options) {
	if (options.indent === true) {
		return magicString.getIndentString();
	}

	return options.indent || '';
}
