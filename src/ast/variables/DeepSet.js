const SET_KEY = {};

export default class DeepSet {
	constructor () {
		this._assignments = new Map( [ [ SET_KEY, new Set() ] ] );
	}

	addAtPath ( path, assignment ) {
		if ( path.length === 0 ) {
			this._assignments.get( SET_KEY ).add( assignment );
		} else {
			const [ nextPath, ...remainingPath ] = path;
			if ( !this._assignments.has( nextPath ) ) {
				this._assignments.set( nextPath, new DeepSet() );
			}
			this._assignments.get( nextPath ).addAtPath( remainingPath, assignment );
		}
	}

	forEachAtPath ( path, callback ) {
		const [ nextPath, ...remainingPath ] = path;
		this._assignments.get( SET_KEY ).forEach( assignment => callback( path, assignment ) );
		if ( path.length > 0 && this._assignments.has( nextPath ) ) {
			this._assignments.get( nextPath ).forEachAtPath( remainingPath, callback );
		}
	}

	someAtPath ( path, predicateFunction ) {
		const [ nextPath, ...remainingPath ] = path;
		return Array.from( this._assignments.get( SET_KEY ) ).some( assignment => predicateFunction( path, assignment ) )
			|| (
				path.length > 0
				&& this._assignments.has( nextPath )
				&& this._assignments.get( nextPath ).someAtPath( remainingPath, predicateFunction )
			);
	}
}
