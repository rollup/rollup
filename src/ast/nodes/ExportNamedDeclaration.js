import Node from '../Node.js';

export default class ExportNamedDeclaration extends Node {
	initialise ( scope ) {
		this.scope = scope;
		this.isExportDeclaration = true;

		if ( this.declaration ) this.declaration.initialise( scope );
		if ( this.specifiers ) this.specifiers.forEach( specifier => specifier.initialise( scope ) );
	}

	bind () {
		if ( this.declaration ) this.declaration.bind();
		if ( this.specifiers ) this.specifiers.forEach( specifier => specifier.bind() );
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
