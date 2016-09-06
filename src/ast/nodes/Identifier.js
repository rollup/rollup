import Node from '../Node.js';
import isReference from '../utils/isReference.js';

export default class Identifier extends Node {
	bind ( scope ) {
		if ( isReference( this, this.parent ) ) {
			this.declaration = scope.findDeclaration( this.name );
			this.declaration.addReference( this ); // TODO necessary?
		}
	}

	gatherPossibleValues ( values ) {
		if ( isReference( this, this.parent ) ) {
			values.add( this );
		}
	}

	render ( code, es ) {
		if ( this.declaration ) {
			const name = this.declaration.getName( es );
			if ( name !== this.name ) {
				code.overwrite( this.start, this.end, name, true );

				// special case
				if ( this.parent.type === 'Property' && this.parent.shorthand ) {
					code.insertLeft( this.start, `${this.name}: ` );
				}
			}
		}
	}

	run () {
		if ( this.declaration ) this.declaration.activate();
	}
}
