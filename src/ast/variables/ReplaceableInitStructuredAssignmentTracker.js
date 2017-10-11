import StructuredAssignmentTracker from './StructuredAssignmentTracker';

export default class ReplaceableInitStructuredAssignmentTracker extends StructuredAssignmentTracker {
	constructor ( init ) {
		super();
		this._init = init;
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
