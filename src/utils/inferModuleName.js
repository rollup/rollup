import { basename, extname } from './path';
import makeLegalIdentifier from './makeLegalIdentifier';
import isLegalIdentifier from './isLegalIdentifier';

export default function inferModuleName ( id ) {
	if ( isLegalIdentifier( id ) ) return id;

	return makeLegalIdentifier( basename( id ).slice( 0, -extname( id ).length ) );
}
