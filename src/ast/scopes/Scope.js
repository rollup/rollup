import { blank, keys } from '../../utils/object.js';
import LocalVariable from '../variables/LocalVariable';
import ParameterVariable from '../variables/ParameterVariable';

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
			this.variables.arguments = new ParameterVariable( 'arguments' );
		}
	}

	addDeclaration ( identifier, isHoisted, init ) {
		const name = identifier.name;
		if ( isHoisted && this.isBlockScope ) {
			this.parent.addDeclaration( identifier, isHoisted, init );
		} else if ( this.variables[ name ] ) {
			const variable = this.variables[ name ];
			variable.addDeclaration( identifier );
			init && variable.assignExpression( init );
		} else {
			this.variables[ name ] = new LocalVariable( identifier.name, identifier, init );
		}
	}

	addParameterDeclaration ( identifier ) {
		const name = identifier.name;
		this.variables[ name ] = new ParameterVariable( name, identifier );
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

	findVariable ( name ) {
		return this.variables[ name ] ||
			( this.parent && this.parent.findVariable( name ) );
	}

	findLexicalBoundary () {
		return this.isLexicalBoundary ? this : this.parent.findLexicalBoundary();
	}
}
