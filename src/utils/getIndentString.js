export default function getIndentString ( magicString, options ) {
	if ( !( 'indent' in options ) || options.indent === true ) {
		return magicString.getIndentString();
	}

	return options.indent || '';
}
