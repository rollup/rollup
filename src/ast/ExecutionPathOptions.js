import Immutable from 'immutable';

const OPTION_IGNORE_BREAK_STATEMENTS = 'IGNORE_BREAK_STATEMENTS';
const OPTION_IGNORE_RETURN_AWAIT_YIELD = 'IGNORE_RETURN_AWAIT_YIELD';
const OPTION_HAS_SAFE_THIS = 'HAS_SAFE_THIS';
const OPTION_CALLED_WITH_NEW = 'CALLED_WITH_NEW';
const OPTION_ACCESSED_NODES = 'ACCESSED_NODES';
const OPTION_ASSIGNED_NODES = 'ASSIGNED_NODES';
const OPTION_CALLED_NODES = 'CALLED_NODES';
const OPTION_NODES_CALLED_WITH_NEW = 'NODES_CALLED_WITH_NEW';
const OPTION_MUTATED_NODES = 'MUTATED_NODES';
const IGNORED_LABELS = 'IGNORED_LABELS';

const RESULT_KEY = {};

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
	 * @return {boolean}
	 */
	hasSafeThis () {
		return this.get( OPTION_HAS_SAFE_THIS );
	}

	/**
	 * @param {boolean} [value=true]
	 * @return {ExecutionPathOptions}
	 */
	setHasSafeThis ( value = true ) {
		return this.set( OPTION_HAS_SAFE_THIS, value );
	}

	/**
	 * @return {boolean}
	 */
	calledWithNew () {
		return this.get( OPTION_CALLED_WITH_NEW );
	}

	/**
	 * @param {boolean} [value=true]
	 * @return {ExecutionPathOptions}
	 */
	setCalledWithNew ( value = true ) {
		return this.set( OPTION_CALLED_WITH_NEW, value );
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
	 * @return {ExecutionPathOptions}
	 */
	addCalledNode ( node ) {
		return this.setIn( [ OPTION_CALLED_NODES, node ], true );
	}

	/**
	 * @param {Node} node
	 * @return {boolean}
	 */
	hasNodeBeenCalled ( node ) {
		return this._optionValues.getIn( [ OPTION_CALLED_NODES, node ] );
	}

	/**
	 * @param {Node} node
	 * @return {ExecutionPathOptions}
	 */
	addNodeCalledWithNew ( node ) {
		return this.setIn( [ OPTION_NODES_CALLED_WITH_NEW, node ], true );
	}

	/**
	 * @param {Node} node
	 * @return {boolean}
	 */
	hasNodeBeenCalledWithNew ( node ) {
		return this._optionValues.getIn( [ OPTION_NODES_CALLED_WITH_NEW, node ] );
	}

	/**
	 * @param {Node} calledNode
	 * @param {boolean} withNew
	 * @return {ExecutionPathOptions}
	 */
	getHasEffectsWhenCalledOptions ( calledNode, { withNew = false } = {} ) {
		return this
			.addCalledNode( calledNode )
			.setIgnoreReturnAwaitYield()
			.setIgnoreBreakStatements( false )
			.setIgnoreNoLabels()
			.setCalledWithNew( withNew );
	}
}
