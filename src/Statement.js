import { keys } from './utils/object';

export default class Statement {
	constructor ( node ) {
		// TODO remove this in favour of this.node
		keys( node ).forEach( key => this[ key ] = node[ key ] );

		this.node = node;
	}
}
