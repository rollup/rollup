import Immutable from 'immutable';

const RESULT_KEY = {};

export default class CallOptions {
	static create ( callOptions ) {
		return new this( callOptions, Immutable.Map() );
	}

	constructor ( { withNew = false, parameters = [] } = {}, nodesCalledAtPath ) {
		this.withNew = withNew;
		this.parameters = parameters;
		this._nodesCalledAtPath = nodesCalledAtPath;
	}

	addCalledNodeAtPath ( path, node ) {
		return new this.constructor( this, this._nodesCalledAtPath.setIn( [ node, ...path, RESULT_KEY ], true ) );
	}

	equals ( callOptions ) {
		return this.withNew === callOptions.withNew
			&& this.parameters.length === callOptions.parameters.length
			&& this.parameters.every( ( parameter, index ) => parameter === callOptions.parameters[ index ] );
	}

	hasNodeBeenCalledAtPath ( path, node ) {
		return this._nodesCalledAtPath.getIn( [ node, ...path, RESULT_KEY ] );
	}
}
