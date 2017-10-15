import Immutable from 'immutable';

const OPTION_IGNORE_BREAK_STATEMENTS = 'IGNORE_BREAK_STATEMENTS';
const OPTION_IGNORE_RETURN_AWAIT_YIELD = 'IGNORE_RETURN_AWAIT_YIELD';
const OPTION_ACCESSED_NODES = 'ACCESSED_NODES';
const OPTION_ASSIGNED_NODES = 'ASSIGNED_NODES';
const OPTION_NODES_CALLED_AT_PATH_WITH_OPTIONS = 'NODES_CALLED_AT_PATH_WITH_OPTIONS';
const OPTION_RETURN_EXPRESSIONS_ACCESSED_AT_PATH = 'RETURN_EXPRESSIONS_ACCESSED_AT_PATH';
const OPTION_RETURN_EXPRESSIONS_ASSIGNED_AT_PATH = 'RETURN_EXPRESSIONS_ASSIGNED_AT_PATH';
const OPTION_RETURN_EXPRESSIONS_CALLED_AT_PATH = 'RETURN_EXPRESSIONS_CALLED_AT_PATH';
const OPTION_REPLACED_VARIABLE_INITS = 'REPLACED_VARIABLE_INITS';
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
	 * @param {string} option - The name of an option
	 * @returns {*} Its value
	 */
	get ( option ) {
		return this._optionValues.get( option );
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
	 * @param {String[]} path
	 * @param {Node} node
	 * @return {ExecutionPathOptions}
	 */
	addAccessedNodeAtPath ( path, node ) {
		return this.setIn( [ OPTION_ACCESSED_NODES, node, ...path, RESULT_KEY ], true );
	}

	/**
	 * @param {String[]} path
	 * @param {CallExpression|Property} callExpression
	 * @return {ExecutionPathOptions}
	 */
	addAccessedReturnExpressionAtPath ( path, callExpression ) {
		return this.setIn( [ OPTION_RETURN_EXPRESSIONS_ACCESSED_AT_PATH, callExpression, ...path, RESULT_KEY ], true );
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
	 * @param {CallExpression|Property} callExpression
	 * @return {ExecutionPathOptions}
	 */
	addAssignedReturnExpressionAtPath ( path, callExpression ) {
		return this.setIn( [ OPTION_RETURN_EXPRESSIONS_ASSIGNED_AT_PATH, callExpression, ...path, RESULT_KEY ], true );
	}

	/**
	 * @param {String[]} path
	 * @param {Node} node
	 * @param {CallOptions} callOptions
	 * @return {ExecutionPathOptions}
	 */
	addCalledNodeAtPathWithOptions ( path, node, callOptions ) {
		return this.setIn( [ OPTION_NODES_CALLED_AT_PATH_WITH_OPTIONS, node, ...path, RESULT_KEY, callOptions ], true );
	}

	/**
	 * @param {String[]} path
	 * @param {CallExpression|Property} callExpression
	 * @return {ExecutionPathOptions}
	 */
	addCalledReturnExpressionAtPath ( path, callExpression ) {
		return this.setIn( [ OPTION_RETURN_EXPRESSIONS_CALLED_AT_PATH, callExpression, ...path, RESULT_KEY ], true );
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
	 * @param {ThisVariable|ParameterVariable} variable
	 * @returns {Node}
	 */
	getReplacedVariableInit ( variable ) {
		return this._optionValues.getIn( [ OPTION_REPLACED_VARIABLE_INITS, variable ] );
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
	 * @return {boolean}
	 */
	hasNodeBeenAssignedAtPath ( path, node ) {
		return this._optionValues.getIn( [ OPTION_ASSIGNED_NODES, node, ...path, RESULT_KEY ] );
	}

	/**
	 * @param {String[]} path
	 * @param {Node} node
	 * @param {CallOptions} callOptions
	 * @return {boolean}
	 */
	hasNodeBeenCalledAtPathWithOptions ( path, node, callOptions ) {
		const previousCallOptions = this._optionValues.getIn( [ OPTION_NODES_CALLED_AT_PATH_WITH_OPTIONS, node, ...path, RESULT_KEY ] );
		return previousCallOptions && previousCallOptions.find( ( _, otherCallOptions ) => otherCallOptions.equals( callOptions ) );
	}

	/**
	 * @param {String[]} path
	 * @param {CallExpression|Property} callExpression
	 * @return {boolean}
	 */
	hasReturnExpressionBeenAccessedAtPath ( path, callExpression ) {
		return this._optionValues.getIn( [ OPTION_RETURN_EXPRESSIONS_ACCESSED_AT_PATH, callExpression, ...path, RESULT_KEY ] );
	}

	/**
	 * @param {String[]} path
	 * @param {CallExpression|Property} callExpression
	 * @return {boolean}
	 */
	hasReturnExpressionBeenAssignedAtPath ( path, callExpression ) {
		return this._optionValues.getIn( [ OPTION_RETURN_EXPRESSIONS_ASSIGNED_AT_PATH, callExpression, ...path, RESULT_KEY ] );
	}

	/**
	 * @param {String[]} path
	 * @param {CallExpression|Property} callExpression
	 * @return {boolean}
	 */
	hasReturnExpressionBeenCalledAtPath ( path, callExpression ) {
		return this._optionValues.getIn( [ OPTION_RETURN_EXPRESSIONS_CALLED_AT_PATH, callExpression, ...path, RESULT_KEY ] );
	}

	/**
	 * @return {boolean}
	 */
	ignoreBreakStatements () {
		return this.get( OPTION_IGNORE_BREAK_STATEMENTS );
	}

	/**
	 * @param {string} labelName
	 * @return {boolean}
	 */
	ignoreLabel ( labelName ) {
		return this._optionValues.getIn( [ IGNORED_LABELS, labelName ] );
	}

	/**
	 * @return {boolean}
	 */
	ignoreReturnAwaitYield () {
		return this.get( OPTION_IGNORE_RETURN_AWAIT_YIELD );
	}

	/**
	 * @param {ThisVariable|ParameterVariable} variable
	 * @param {Node} init
	 * @return {ExecutionPathOptions}
	 */
	replaceVariableInit ( variable, init ) {
		return this.setIn( [ OPTION_REPLACED_VARIABLE_INITS, variable ], init );
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
	 * @param {boolean} [value=true]
	 * @return {ExecutionPathOptions}
	 */
	setIgnoreReturnAwaitYield ( value = true ) {
		return this.set( OPTION_IGNORE_RETURN_AWAIT_YIELD, value );
	}
}
