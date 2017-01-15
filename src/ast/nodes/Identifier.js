import Node from '../Node.js';
import isReference from 'is-reference';

function isAssignmentPatternLhs ( node, parent ) {
	// special case: `({ foo = 42 }) => {...}`
	// `foo` actually has two different parents, the Property of the
	// ObjectPattern, and the AssignmentPattern. In one case it's a
	// reference, in one case it's not, because it's shorthand for
	// `({ foo: foo = 42 }) => {...}`. But unlike a regular shorthand
	// property, the `foo` node appears at different levels of the tree
	return (
		parent.type === 'Property' &&
		parent.shorthand &&
		parent.value.type === 'AssignmentPattern' &&
		parent.value.left === node
	);
}

export default class Identifier extends Node {
	activate () {
		if ( this.declaration ) {
			this.declaration.activate();
		}
	}

	bind () {
		if ( isReference( this, this.parent ) || isAssignmentPatternLhs( this, this.parent ) ) {
			this.declaration = this.scope.findDeclaration( this.name );
			this.declaration.addReference( this ); // TODO necessary?
		}
	}

	call ( args ) {
		const callee = this.scope.getValue( this.name );
		if ( !callee.call ) {
			throw new Error( `${callee} does not have call method (${this})` );
		}

		return callee.call( undefined, args );
	}

	gatherPossibleValues ( values ) {
		if ( isReference( this, this.parent ) ) {
			values.add( this );
		}
	}

	getInstance () {
		return this.getValue().getInstance();
	}

	getReturnValue ( args ) {
		return this.declaration.getReturnValue( undefined, args );
	}

	initialise ( scope ) {
		this.scope = scope;
	}

	mark () {
		if ( this.declaration ) {
			this.declaration.activate();
		}
	}

	markReturnStatements ( args ) {
		const callee = this.scope.getValue( this.name );

		if ( !callee ) {
			throw new Error( `could not resolve callee ${this} ${this.locate()}` );
		}

		if ( !callee.markReturnStatements ) {
			throw new Error( `${callee} does not have markReturnStatements method` );
		}
		callee.markReturnStatements( undefined, args );
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
		return this.scope.getValue( this.name );
	}

	setValue ( value ) {
		this.scope.setValue( this.name, value );
	}
}
