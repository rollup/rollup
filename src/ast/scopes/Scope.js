import { blank, keys } from '../../utils/object.js';
import { UNKNOWN_ASSIGNMENT } from '../values';
import Variable from '../variables/Variable';

class Parameter {
	constructor ( name ) {
		this.name = name;
		this.isParam = true;
		this.assignedExpressions = new Set( [ UNKNOWN_ASSIGNMENT ] );
	}

	addReference () {}

	assignExpression ( expression ) {
		this.assignedExpressions.add( expression );
		this.isReassigned = true;
	}

	gatherPossibleValues ( values ) {
		values.add( UNKNOWN_ASSIGNMENT ); // TODO populate this at call time
	}

	getName () {
		return this.name;
	}

	includeDeclaration () {
		if ( this.included ) {
			return false;
		}
		this.included = true;
		return true;
	}
}

export default class Scope {
	constructor ( options = {} ) {
		this.parent = options.parent;
		this.isBlockScope = !!options.isBlockScope;
		this.isLexicalBoundary = !!options.isLexicalBoundary;
		this.isModuleScope = !!options.isModuleScope;

		this.children = [];
		if ( this.parent ) this.parent.children.push( this );

		this.variables = blank();

		if ( this.isLexicalBoundary && !this.isModuleScope ) {
			this.variables.arguments = new Parameter( 'arguments' );
		}
	}

	addDeclaration(identifier, isHoisted, init) {
		const variable = new Variable( identifier.name, identifier, init );
		this.addVariable( identifier.name, variable, isHoisted );
		return variable;
	}

	addVariable ( name, variable, isHoisted, isParam ) {
		if ( isHoisted && this.isBlockScope ) {
			this.parent.addVariable( name, variable, isHoisted, isParam );
		} else {
			const existingDeclaration = this.variables[ name ];

			if ( existingDeclaration && existingDeclaration.duplicates ) {
				// TODO warn/throw on duplicates?
				existingDeclaration.duplicates.push( variable );
			} else {
				this.variables[ name ] = isParam ? new Parameter( name ) : variable;
			}
		}
	}

	contains ( name ) {
		return !!this.variables[ name ] ||
			( this.parent ? this.parent.contains( name ) : false );
	}

	deshadow ( names ) {
		keys( this.variables ).forEach( key => {
			const declaration = this.variables[ key ];

			// we can disregard exports.foo etc
			if ( declaration.exportName && declaration.isReassigned ) return;

			const name = declaration.getName( true );
			let deshadowed = name;

			let i = 1;

			while ( names.has( deshadowed ) ) {
				deshadowed = `${name}$$${i++}`;
			}

			declaration.name = deshadowed;
		} );

		this.children.forEach( scope => scope.deshadow( names ) );
	}

	findDeclaration ( name ) {
		return this.variables[ name ] ||
			( this.parent && this.parent.findDeclaration( name ) );
	}

	findLexicalBoundary () {
		return this.isLexicalBoundary ? this : this.parent.findLexicalBoundary();
	}
}
