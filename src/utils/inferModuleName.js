import { basename, extname } from './path';
import makeLegalIdentifier from './makeLegalIdentifier';

export default function inferModuleName ( id ) {
	return makeLegalIdentifier( basename( id ).slice( 0, -extname( id ).length ) );
}
