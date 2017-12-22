import { Bundle as MagicStringBundle } from 'magic-string';

export default function getIndentString (magicString: MagicStringBundle, options: { indent?: boolean }) {
	if (options.indent === true) {
		return magicString.getIndentString();
	}

	return options.indent || '';
}
