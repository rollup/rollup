import Node from '../Node.js';
import { UNKNOWN_VALUE } from '../values.js';

export default class LogicalExpression extends Node {
	bindAssignmentAtPath ( path, expression, options ) {
		path.length > 0
		&& this._forEachRelevantBranch( node => node.bindAssignmentAtPath( path, expression, options ) );
	}

	bindCallAtPath ( path, callOptions, options ) {
		this._forEachRelevantBranch( node => node.bindCallAtPath( path, callOptions, options ) );
	}

	forEachReturnExpressionWhenCalledAtPath ( path, callOptions, callback, options ) {
		this._forEachRelevantBranch( node => node.forEachReturnExpressionWhenCalledAtPath( path, callOptions, callback, options ) );
	}

	getValue () {
		const leftValue = this.left.getValue();
		if ( leftValue === UNKNOWN_VALUE ) return UNKNOWN_VALUE;
		if ( (leftValue && this.operator === '||') || (!leftValue && this.operator === '&&') ) {
			return leftValue;
		}
		return this.right.getValue();
	}

	hasEffects ( options ) {
		const leftValue = this.left.getValue();
		return this.left.hasEffects( options )
			|| (
				( leftValue === UNKNOWN_VALUE
					|| (!leftValue && this.operator === '||')
					|| (leftValue && this.operator === '&&') )
				&& this.right.hasEffects( options )
			);
	}

	hasEffectsWhenAccessedAtPath ( path, options ) {
		return path.length > 0
			&& this._someRelevantBranch( node =>
				node.hasEffectsWhenAccessedAtPath( path, options ) );
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		return path.length === 0
			|| this._someRelevantBranch( node => node.hasEffectsWhenAssignedAtPath( path, options ) );
	}

	hasEffectsWhenCalledAtPath ( path, callOptions, options ) {
		return this._someRelevantBranch( node =>
			node.hasEffectsWhenCalledAtPath( path, callOptions, options ) );
	}

	someReturnExpressionWhenCalledAtPath ( path, callOptions, predicateFunction, options ) {
		return this._someRelevantBranch( node =>
			node.someReturnExpressionWhenCalledAtPath( path, callOptions, predicateFunction, options ) );
	}

	_forEachRelevantBranch ( callback ) {
		const leftValue = this.left.getValue();
		if ( leftValue === UNKNOWN_VALUE ) {
			callback( this.left );
			callback( this.right );
		} else if ( (leftValue && this.operator === '||') || (!leftValue && this.operator === '&&') ) {
			callback( this.left );
		} else {
			callback( this.right );
		}
	}

	_someRelevantBranch ( predicateFunction ) {
		const leftValue = this.left.getValue();
		if ( leftValue === UNKNOWN_VALUE ) {
			return predicateFunction( this.left ) || predicateFunction( this.right );
		}
		if ( (leftValue && this.operator === '||') || (!leftValue && this.operator === '&&') ) {
			return predicateFunction( this.left );
		}
		return predicateFunction( this.right );
	}
}
