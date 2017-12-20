import MagicString from "magic-string";

export default function getIndentString (magicString: MagicString, options: { indent: boolean }) {
	if (options.indent === true) {
		return magicString.getIndentString();
	}

	return options.indent || '';
}
