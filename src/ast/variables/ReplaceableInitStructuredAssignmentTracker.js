import StructuredAssignmentTracker from './StructuredAssignmentTracker';
import LocalVariable from './LocalVariable';

export default class ReplaceableInitStructuredAssignmentTracker extends StructuredAssignmentTracker {
	constructor () {
		super();
		this._init = new LocalVariable( {}, null, null );
	}

	addAtPath ( path, assignment ) {
		if ( path.length > 0 ) {
			this._init.bindAssignmentAtPath( path, assignment );
		}
		super.addAtPath( path, assignment );
	}

	addInit ( assignment ) {
		this._init.bindAssignmentAtPath( [], assignment );
	}

	forEachAtPath ( path, callback ) {
		callback( path, this._init );
		super.forEachAtPath( path, callback );
	}

	hasAtPath ( path, assignment ) {
		return (path.length === 0 && assignment === this._init)
			|| super.hasAtPath( path, assignment );
	}

	setInit ( init ) {
		this._init = init;
	}

	someAtPath ( path, predicateFunction ) {
		return predicateFunction( path, this._init )
			|| super.someAtPath( path, predicateFunction );
	}
}
