import Immutable from 'immutable';

const RESULT_KEY = {};

export default class CallOptions {
	static create ( callOptions ) {
		return new this( callOptions, Immutable.Map() );
	}

	constructor ( { withNew = false } = {}, nodesCalledAtPath ) {
		this.withNew = withNew;
		this._nodesCalledAtPath = nodesCalledAtPath;
	}

	addCalledNodeAtPath ( path, node ) {
		return new this.constructor( this, this._nodesCalledAtPath.setIn( [ node, ...path, RESULT_KEY ], true ) );
	}

	equals ( callOptions ) {
		return this.withNew === callOptions.withNew;
	}

	hasNodeBeenCalledAtPath ( path, node ) {
		return this._nodesCalledAtPath.getIn( [ node, ...path, RESULT_KEY ] );
	}
}
