import { blank, keys } from '../../utils/object.js';
import { UNKNOWN, TDZ_VIOLATION } from '../values.js';

class Parameter {
	constructor ( name ) {
		this.name = name;

		this.isParam = true;
		this.activated = true;
	}

	activate () {
		// noop
	}

	addReference () {
		// noop?
	}

	gatherPossibleValues ( values ) {
		values.add( UNKNOWN ); // TODO populate this at call time
	}

	getName () {
		return this.name;
	}
}

export default class Scope {
	constructor ( options = {} ) {
		this.owner = options.owner;
		this.parent = options.parent;
		this.isBlockScope = !!options.isBlockScope;
		this.isLexicalBoundary = !!options.isLexicalBoundary;
		this.isModuleScope = !!options.isModuleScope;

		this.children = [];
		if ( this.parent ) this.parent.children.push( this );

		this.declarations = blank();
		this.values = blank();

		if ( this.isLexicalBoundary && !this.isModuleScope ) {
			this.declarations.arguments = new Parameter( 'arguments' );
		}
	}

	addDeclaration ( name, declaration, isVar, isParam ) {
		if ( isVar && this.isBlockScope ) {
			this.parent.addDeclaration( name, declaration, isVar, isParam );
		} else {
			const existingDeclaration = this.declarations[ name ];

			if ( existingDeclaration && existingDeclaration.duplicates ) {
				// TODO warn/throw on duplicates?
				existingDeclaration.duplicates.push( declaration );
			} else {
				this.declarations[ name ] = isParam ? new Parameter( name ) : declaration;
			}
		}
	}

	contains ( name ) {
		return !!this.declarations[ name ] ||
		       ( this.parent ? this.parent.contains( name ) : false );
	}

	deshadow ( names ) {
		this.eachDeclaration( ( key, declaration ) => {
			// we can disregard exports.foo etc
			if ( declaration.exportName && declaration.isReassigned ) return;

			const name = declaration.getName( true );
			let deshadowed = name;

			let i = 1;

			while ( names.has( deshadowed ) ) {
				deshadowed = `${name}$$${i++}`;
			}

			declaration.name = deshadowed;
		});

		this.children.forEach( scope => scope.deshadow( names ) );
	}

	eachDeclaration ( callback ) {
		keys( this.declarations ).forEach( key => {
			const declaration = this.declarations[ key ];
			callback( key, declaration );
		});
	}

	findDeclaration ( name ) {
		return this.declarations[ name ] ||
		       ( this.parent && this.parent.findDeclaration( name ) );
	}

	findLexicalBoundary () {
		return this.isLexicalBoundary ? this : this.parent.findLexicalBoundary();
	}

	getValue ( name ) {
		if ( name in this.values ) {
			return this.values[ name ];
		}

		if ( this.parent ) {
			return this.parent.getValue( name );
		}

		throw new Error( `hmm ${name}` );
	}

	initialise () {
		this.eachDeclaration( ( name, declaration ) => {
			if ( declaration.isDeclaratorProxy ) {
				this.values[ name ] = declaration.declarator.kind === 'var' ? undefined : TDZ_VIOLATION;
			} else if ( declaration.isParam || declaration.type === 'ExportDefaultDeclaration' ) {
				this.values[ name ] = undefined;
			} else if ( declaration.type === 'ClassDeclaration' ) {
				this.values[ name ] = TDZ_VIOLATION;
			} else if ( declaration.type === 'FunctionDeclaration' ) {
				this.values[ name ] = declaration;
			} else {
				console.log( declaration )
				throw new Error( 'well this is odd' );
			}
		});
	}

	setValue ( name, value ) {
		this.values[ name ] = value;

		if ( !( name in this.declarations ) ) {
			// TODO if this scope's owner is a conditional, the parent scope
			// should know that there are multiple possible values, and if
			// it's a loop, same. if it's a function? god knows. need to
			// figure that out
		}
	}
}
