import Immutable from 'immutable';

const OPTION_IGNORE_BREAK_STATEMENTS = 'IGNORE_BREAK_STATEMENTS';
const OPTION_IGNORE_RETURN_AWAIT_YIELD = 'IGNORE_RETURN_AWAIT_YIELD';
const OPTION_ACCESSED_NODES = 'ACCESSED_NODES';
const OPTION_ASSIGNED_NODES = 'ASSIGNED_NODES';
const OPTION_NODES_CALLED_WITH_OPTIONS = 'OPTION_NODES_CALLED_WITH_OPTIONS';
const OPTION_MUTATED_NODES = 'MUTATED_NODES';
const OPTION_VALID_THIS_VARIABLES = 'VALID_THIS_VARIABLES';
const IGNORED_LABELS = 'IGNORED_LABELS';

const RESULT_KEY = {};

const areCallOptionsEqual = ( options, otherOptions ) => options.withNew === otherOptions.withNew;

/** Wrapper to ensure immutability */
export default class ExecutionPathOptions {
	/**
	 * @returns {ExecutionPathOptions}
	 */
	static create () {
		return new this( Immutable.Map() );
	}

	constructor ( optionValues ) {
		this._optionValues = optionValues;
	}

	/**
	 * Returns a new ExecutionPathOptions instance with the given option set to a new value.
	 * Does not mutate the current instance. Also works in sub-classes.
	 * @param {string} option - The name of an option
	 * @param {*} value - The new value of the option
	 * @returns {ExecutionPathOptions} A new options instance
	 */
	set ( option, value ) {
		return new this.constructor( this._optionValues.set( option, value ) );
	}

	setIn ( optionPath, value ) {
		return new this.constructor( this._optionValues.setIn( optionPath, value ) );
	}

	/**
	 * @param {string} option - The name of an option
	 * @returns {*} Its value
	 */
	get ( option ) {
		return this._optionValues.get( option );
	}

	/**
	 * @return {boolean}
	 */
	ignoreBreakStatements () {
		return this.get( OPTION_IGNORE_BREAK_STATEMENTS );
	}

	/**
	 * @param {boolean} [value=true]
	 * @return {ExecutionPathOptions}
	 */
	setIgnoreBreakStatements ( value = true ) {
		return this.set( OPTION_IGNORE_BREAK_STATEMENTS, value );
	}

	/**
	 * @param {string} labelName
	 * @return {boolean}
	 */
	ignoreLabel ( labelName ) {
		return this._optionValues.getIn( [ IGNORED_LABELS, labelName ] );
	}

	/**
	 * @param {string} labelName
	 * @return {ExecutionPathOptions}
	 */
	setIgnoreLabel ( labelName ) {
		return this.setIn( [ IGNORED_LABELS, labelName ], true );
	}

	/**
	 * @return {ExecutionPathOptions}
	 */
	setIgnoreNoLabels () {
		return this.set( IGNORED_LABELS, null );
	}

	/**
	 * @return {boolean}
	 */
	ignoreReturnAwaitYield () {
		return this.get( OPTION_IGNORE_RETURN_AWAIT_YIELD );
	}

	/**
	 * @param {boolean} [value=true]
	 * @return {ExecutionPathOptions}
	 */
	setIgnoreReturnAwaitYield ( value = true ) {
		return this.set( OPTION_IGNORE_RETURN_AWAIT_YIELD, value );
	}

	/**
	 * @param {String[]} path
	 * @param {Node} node
	 * @return {ExecutionPathOptions}
	 */
	addAccessedNodeAtPath ( path, node ) {
		return this.setIn( [ OPTION_ACCESSED_NODES, node, ...path, RESULT_KEY ], true );
	}

	/**
	 * @param {String[]} path
	 * @param {Node} node
	 * @return {boolean}
	 */
	hasNodeBeenAccessedAtPath ( path, node ) {
		return this._optionValues.getIn( [ OPTION_ACCESSED_NODES, node, ...path, RESULT_KEY ] );
	}

	/**
	 * @param {String[]} path
	 * @param {Node} node
	 * @return {ExecutionPathOptions}
	 */
	addAssignedNodeAtPath ( path, node ) {
		return this.setIn( [ OPTION_ASSIGNED_NODES, node, ...path, RESULT_KEY ], true );
	}

	/**
	 * @param {String[]} path
	 * @param {Node} node
	 * @return {boolean}
	 */
	hasNodeBeenAssignedAtPath ( path, node ) {
		return this._optionValues.getIn( [ OPTION_ASSIGNED_NODES, node, ...path, RESULT_KEY ] );
	}

	/**
	 * @param {Node} node
	 * @return {ExecutionPathOptions}
	 */
	addMutatedNode ( node ) {
		return this.setIn( [ OPTION_MUTATED_NODES, node ], true );
	}

	/**
	 * @param {Node} node
	 * @return {boolean}
	 */
	hasNodeBeenMutated ( node ) {
		return this._optionValues.getIn( [ OPTION_MUTATED_NODES, node ] );
	}

	/**
	 * @param {Node} node
	 * @param {Object} callOptions
	 * @return {ExecutionPathOptions}
	 */
	addNodeCalledWithOptions ( node, callOptions ) {
		return this.setIn( [ OPTION_NODES_CALLED_WITH_OPTIONS, node, callOptions ], true );
	}

	/**
	 * @param {Node} node
	 * @param {Object} callOptions
	 * @return {boolean}
	 */
	hasNodeBeenCalledWithOptions ( node, callOptions ) {
		return this._optionValues.hasIn( [ OPTION_NODES_CALLED_WITH_OPTIONS, node ] )
			&& this._optionValues.getIn( [ OPTION_NODES_CALLED_WITH_OPTIONS, node ] )
				.find( ( _, options ) => areCallOptionsEqual( options, callOptions ) );
	}

	/**
	 * @return {ExecutionPathOptions}
	 */
	getHasEffectsWhenCalledOptions () {
		return this
			.setIgnoreReturnAwaitYield()
			.setIgnoreBreakStatements( false )
			.setIgnoreNoLabels();
	}

	/**
	 * @param {ThisVariable} thisVariable
	 * @param {Node} init
	 * @return {ExecutionPathOptions}
	 */
	replaceThisInit ( thisVariable, init ) {
		return this.setIn( [ OPTION_VALID_THIS_VARIABLES, thisVariable ], init );
	}

	/**
	 * @param {ThisVariable} thisVariable
	 * @returns {Node}
	 */
	getReplacedThisInit ( thisVariable ) {
		return this._optionValues.getIn( [ OPTION_VALID_THIS_VARIABLES, thisVariable ] );
	}
}
