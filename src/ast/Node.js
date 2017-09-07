import { locate } from 'locate-character';
import { UNKNOWN_VALUE } from './values.js';
import ExecutionPathOptions from './ExecutionPathOptions';

export default class Node {
	/**
	 * Called once all nodes have been initialised and the scopes have been populated.
	 * Use this to bind assignments and calls to variables.
	 */
	bind () {
		this.eachChild( child => child.bind() );
	}

	/**
	 * Bind an expression as an assignment to a node.
	 * The default noop implementation is ok as long as hasEffectsWhenAssigned
	 * always returns true for this node. Otherwise it should be overridden.
	 * @param {Node} expression
	 */
	bindAssignment () {}

	/**
	 * Binds ways a node is called to a node. Current options are:
	 * - withNew: boolean - Did this call use the "new" operator
	 * The default noop implementation is ok as long as hasEffectsWhenCalled
	 * always returns true for this node. Otherwise it should be overridden.
	 * @param callOptions
	 */
	bindCall () {}

	eachChild ( callback ) {
		this.keys.forEach( key => {
			const value = this[ key ];
			if ( !value ) return;

			if ( Array.isArray( value ) ) {
				value.forEach( child => child && callback( child ) );
			} else {
				callback( value );
			}
		} );
	}

	getValue () {
		return UNKNOWN_VALUE;
	}

	/**
	 * Determine if this Node would have an effect on the bundle.
	 * This is usually true for already included nodes. Exceptions are e.g. break statements
	 * which only have an effect if their surrounding loop or switch statement is included.
	 * The options pass on information like this about the current execution path.
	 * @param {ExecutionPathOptions} options
	 * @return {boolean}
	 */
	hasEffects ( options ) {
		return this.included || this.someChild( child => child.hasEffects( options ) );
	}

	/**
	 * Special make-shift logic to treat cases where apparently side-effect free statements
	 * are executed for side-effects. The most important case are getters with side-effects.
	 * Once we can reliably handle this case in member expressions, this function should
	 * probably be removed again.
	 * @param {ExecutionPathOptions} options
	 * @return {boolean}
	 */
	hasEffectsAsExpressionStatement () {
		return true;
	}

	/**
	 * @param {ExecutionPathOptions} options
	 * @return {boolean}
	 */
	hasEffectsWhenAssigned () {
		return true;
	}

	/**
	 * @param {ExecutionPathOptions} options
	 * @return {boolean}
	 */
	hasEffectsWhenCalled () {
		return true;
	}

	/**
	 * @param {ExecutionPathOptions} options
	 * @return {boolean}
	 */
	hasEffectsWhenMutated () {
		return true;
	}

	/**
	 * Includes the node in the bundle. Children are usually included if they are
	 * necessary for this node (e.g. a function body) or if they have effects.
	 * Necessary variables should be included as well. Should return true if any
	 * nodes or variables have been added that were missing before.
	 * @return {boolean}
	 */
	includeInBundle () {
		if ( this.isFullyIncluded() ) return false;
		let addedNewNodes = false;
		this.eachChild( childNode => {
			if ( childNode.includeInBundle() ) {
				addedNewNodes = true;
			}
		} );
		if ( this.included && !addedNewNodes ) {
			return false;
		}
		this.included = true;
		return true;
	}

	/**
	 * Alternative version of includeInBundle to override the default behaviour of
	 * declarations to only include nodes for declarators that have an effect. Necessary
	 * for for-loops that do not use a declared loop variable.
	 * @return {boolean}
	 */
	includeWithAllDeclarations () {
		return this.includeInBundle();
	}

	/**
	 * Assign a scope to this node and make sure all children have the right scopes.
	 * Perform any additional initialisation that does not depend on the scope being
	 * populated with variables.
	 * Usually one should not override this function but override initialiseScope,
	 * initialiseNode and/or initialiseChildren instead. BlockScopes have a special
	 * alternative initialisation initialiseAndReplaceScope.
	 * @param {Scope} parentScope
	 */
	initialise ( parentScope ) {
		this.initialiseScope( parentScope );
		this.initialiseNode( parentScope );
		this.initialiseChildren( parentScope );
	}

	/**
	 * Override to change how and with what scopes children are initialised
	 * @param {Scope} parentScope
	 */
	initialiseChildren () {
		this.eachChild( child => child.initialise( this.scope ) );
	}

	/**
	 * Override to perform special initialisation steps after the scope is initialised
	 * @param {Scope} parentScope
	 */
	initialiseNode () {}

	/**
	 * Override if this scope should receive a different scope than the parent scope.
	 * @param {Scope} parentScope
	 */
	initialiseScope ( parentScope ) {
		this.scope = parentScope;
	}

	insertSemicolon ( code ) {
		if ( code.original[ this.end - 1 ] !== ';' ) {
			code.appendLeft( this.end, ';' );
		}
	}

	/**
	 * Shortcut to skip checking this node for effects when all children have already
	 * been included.
	 * @param {Scope} parentScope
	 */
	isFullyIncluded () {
		if ( this._fullyIncluded ) {
			return true;
		}
		this._fullyIncluded = this.included && !this.someChild( child => !child.isFullyIncluded() );
	}

	locate () {
		// useful for debugging
		const location = locate( this.module.code, this.start, { offsetLine: 1 } );
		location.file = this.module.id;
		location.toString = () => JSON.stringify( location );

		return location;
	}

	render ( code, es ) {
		this.eachChild( child => child.render( code, es ) );
	}

	/**
	 * Start a new execution path to determine if this node has an effect on the bundle and
	 * should therefore be included. Unless they are fully included, included nodes should
	 * always be included again in subsequent visits as the inclusion of additional variables
	 * may require the inclusion of more child nodes in e.g. block statements.
	 * @return {boolean}
	 */
	shouldBeIncluded () {
		return this.hasEffects( ExecutionPathOptions.create() );
	}

	someChild ( callback ) {
		return this.keys.some( key => {
			const value = this[ key ];
			if ( !value ) return false;

			if ( Array.isArray( value ) ) {
				return value.some( child => child && callback( child ) );
			}
			return callback( value );
		} );
	}

	toString () {
		return this.module.code.slice( this.start, this.end );
	}
}
