const VALUE = '2';

export function fn2 ( value ) {
	switch ( value ) {
		case VALUE:
			return 'correct';
		default:
			return 'not matched';
	}
}
