import { find } from '../../utils/array.js';
import Node from '../Node.js';

class UnboundDefaultExport {
	constructor ( original ) {
		this.original = original;
		this.name = original.name;
	}

	activate () {
		if ( this.activated ) return;
		this.activated = true;

		this.original.activate();
	}

	addReference ( reference ) {
		this.name = reference.name;
		this.original.addReference( reference );
	}

	bind ( scope ) {
		this.original.bind( scope );
	}

	gatherPossibleValues ( values ) {
		this.original.gatherPossibleValues( values );
	}

	getName ( es ) {
		if ( this.original && !this.original.isReassigned ) {
			return this.original.getName( es );
		}

		return this.name;
	}
}

export default class ExportNamedDeclaration extends Node {
	initialise ( scope ) {
		this.scope = scope;
		this.isExportDeclaration = true;

		// special case – `export { foo as default }` should not create a live binding
		const defaultExport = find( this.specifiers, specifier => specifier.exported.name === 'default' );
		if ( defaultExport ) {
			const declaration = this.scope.findDeclaration( defaultExport.local.name );
			this.defaultExport = new UnboundDefaultExport( declaration );
			scope.declarations.default = this.defaultExport;
		}

		if ( this.declaration ) this.declaration.initialise( scope );
	}

	bind ( scope ) {
		if ( this.declaration ) this.declaration.bind( scope );
	}

	render ( code, es ) {
		if ( this.declaration ) {
			code.remove( this.start, this.declaration.start );
			this.declaration.render( code, es );
		} else {
			const start = this.leadingCommentStart || this.start;
			const end = this.next || this.end;

			if ( this.defaultExport ) {
				const name = this.defaultExport.getName( es );
				const originalName = this.defaultExport.original.getName( es );

				if ( name !== originalName ) {
					code.overwrite( start, end, `var ${name} = ${originalName};` );
					return;
				}
			}

			code.remove( start, end );
		}
	}
}
