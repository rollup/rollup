import Node from '../Node.js';
import isReference from 'is-reference';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class Identifier extends Node {
	bindNode () {
		this._bindVariableIfMissing();
	}

	bindAssignmentAtPath ( path, expression ) {
		this._bindVariableIfMissing();
		if ( this.variable ) {
			this.variable.assignExpressionAtPath( path, expression );
		}
	}

	_bindVariableIfMissing () {
		if ( !this.variable && isReference( this, this.parent ) ) {
			this.variable = this.scope.findVariable( this.name );
			this.variable.addReference( this );
		}
	}

	hasEffectsWhenAccessedAtPath ( path, options ) {
		return this.variable
			&& this.variable.hasEffectsWhenAccessedAtPath( path, options );
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		return !this.variable
			|| this.variable.hasEffectsWhenAssignedAtPath( path, options );
	}

	hasEffectsWhenCalledAtPath ( path, callOptions, options ) {
		return !this.variable
			|| this.variable.hasEffectsWhenCalledAtPath( path, callOptions, options );
	}

	includeInBundle () {
		if ( this.included ) return false;
		this.included = true;
		this.variable && this.variable.includeVariable();
		return true;
	}

	initialiseAndDeclare ( parentScope, kind, init ) {
		this.initialiseScope( parentScope );
		switch ( kind ) {
			case 'var':
			case 'function':
				this.variable = this.scope.addDeclaration( this, { isHoisted: true, init } );
				break;
			case 'let':
			case 'const':
			case 'class':
				this.variable = this.scope.addDeclaration( this, { init } );
				break;
			case 'parameter':
				this.variable = this.scope.addParameterDeclaration( this );
				break;
			default:
				throw new Error( 'Unexpected identifier kind', kind );
		}
	}

	render ( code, es ) {
		if ( this.variable ) {
			const name = this.variable.getName( es );
			if ( name !== this.name ) {
				code.overwrite( this.start, this.end, name, { storeName: true, contentOnly: false } );

				// special case
				if ( this.parent.type === 'Property' && this.parent.shorthand ) {
					code.appendLeft( this.start, `${this.name}: ` );
				}
			}
		}
	}

	someReturnExpressionAtPath ( path, callOptions, predicateFunction ) {
		if ( this.variable ) {
			return this.variable.someReturnExpressionAtPath( path, callOptions, predicateFunction );
		}
		return predicateFunction( path, UNKNOWN_ASSIGNMENT );
	}
}
