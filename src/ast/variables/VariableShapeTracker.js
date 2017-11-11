import { UNKNOWN_ASSIGNMENT } from '../values';

const SET_KEY = { type: 'SET_KEY' };
export const UNKNOWN_KEY = { type: 'UNKNOWN_KEY' };

const UNKNOWN_ASSIGNMENTS = new Map( [ [ SET_KEY, new Set( [ UNKNOWN_ASSIGNMENT ] ) ] ] );
const UNKNOWN_KEY_ASSIGNMENT = [ UNKNOWN_KEY, { toString: ( path = '' ) => path + '[[UNKNOWN_KEY]]' } ];

export default class VariableShapeTracker {
	constructor () {
		this._assignments = new Map( [ [ SET_KEY, new Set() ] ] );
	}

	addAtPath ( path, assignment ) {
		if ( this._assignments === UNKNOWN_ASSIGNMENTS
			|| (path.length > 0 && this._assignments.has( UNKNOWN_KEY ) ) ) return;
		if ( path.length === 0 && assignment === UNKNOWN_ASSIGNMENT ) {
			this._assignments = UNKNOWN_ASSIGNMENTS;
		} else if ( path[ 0 ] === UNKNOWN_KEY ) {
			this._assignments = new Map( [ [ SET_KEY, this._assignments.get( SET_KEY ) ], UNKNOWN_KEY_ASSIGNMENT ] );
		} else if ( path.length === 0 ) {
			this._assignments.get( SET_KEY ).add( assignment );
		} else {
			const [ nextPath, ...remainingPath ] = path;
			if ( !this._assignments.has( nextPath ) ) {
				this._assignments.set( nextPath, new VariableShapeTracker() );
			}
			this._assignments.get( nextPath ).addAtPath( remainingPath, assignment );
		}
	}

	forEachAtPath ( path, callback ) {
		const [ nextPath, ...remainingPath ] = path;
		this._assignments.get( SET_KEY ).forEach( assignment => callback( path, assignment ) );
		if ( path.length > 0
			&& nextPath !== UNKNOWN_KEY
			&& !this._assignments.has( UNKNOWN_KEY )
			&& this._assignments.has( nextPath ) ) {
			this._assignments.get( nextPath ).forEachAtPath( remainingPath, callback );
		}
	}

	forEachAssignedToPath ( path, callback ) {
		if ( this._assignments === UNKNOWN_ASSIGNMENTS || this._assignments.has( UNKNOWN_KEY ) ) return;
		if ( path.length > 0 ) {
			const [ nextPath, ...remainingPath ] = path;
			if ( nextPath === UNKNOWN_KEY || this._assignments.has( UNKNOWN_KEY ) ) return;
			if ( this._assignments.has( nextPath ) ) {
				this._assignments.get( nextPath ).forEachAssignedToPath( remainingPath, callback );
			}
		} else {
			this._assignments.get( SET_KEY ).forEach( assignment => callback( [], assignment ) );
			this._assignments.forEach( ( assignment, subPath ) => {
				if ( subPath !== SET_KEY ) {
					assignment.forEachAssignedToPath( [],
						( relativePath, assignment ) => callback( [ subPath, ...relativePath ], assignment ) );
				}
			} );
		}
	}

	hasAtPath ( path, assignment ) {
		if ( this._assignments === UNKNOWN_ASSIGNMENTS ) return true;
		if ( path.length === 0 ) {
			return this._assignments.get( SET_KEY ).has( assignment );
		} else {
			if ( this._assignments.has( UNKNOWN_KEY ) ) return true;
			const [ nextPath, ...remainingPath ] = path;
			if ( !this._assignments.has( nextPath ) ) {
				return false;
			}
			return this._assignments.get( nextPath ).hasAtPath( remainingPath, assignment );
		}
	}

	someAtPath ( path, predicateFunction ) {
		const [ nextPath, ...remainingPath ] = path;
		return Array.from( this._assignments.get( SET_KEY ) ).some( assignment => predicateFunction( path, assignment ) )
			|| (
				path.length > 0
				&& (
					(nextPath === UNKNOWN_KEY || this._assignments.has( UNKNOWN_KEY )
						? predicateFunction( remainingPath, UNKNOWN_ASSIGNMENT )
						: this._assignments.has( nextPath )
						&& this._assignments.get( nextPath ).someAtPath( remainingPath, predicateFunction ))
				)
			);
	}

	// For debugging purposes
	toString ( pathString = '/' ) {
		return Array.from( this._assignments ).map( ( [ subPath, subAssignment ] ) => subPath === SET_KEY
			? Array.from( subAssignment ).map( assignment => pathString + assignment.toString() ).join( '\n' )
			: subAssignment.toString( pathString + subPath + ': ' ) ).join( '\n' );
	}
}
