const VALUE = '1';

export function fn1 ( value ) {
	switch ( value ) {
		case VALUE:
			return 'correct';
		default:
			return 'not matched';
	}
}
