import Immutable from 'immutable';

const OPTION_IGNORE_BREAK_STATEMENTS = 'IGNORE_BREAK_STATEMENTS';
const OPTION_IGNORE_RETURN_AWAIT_YIELD = 'IGNORE_RETURN_AWAIT_YIELD';
const OPTION_IGNORE_SAFE_THIS_MUTATIONS = 'IGNORE_SAFE_THIS_MUTATIONS';
const OPTION_CALLED_NODES = 'CALLED_NODES';
const OPTION_MUTATED_NODES = 'MUTATED_NODES';
const IGNORED_LABELS = 'IGNORED_LABELS';

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
	ignoreSafeThisMutations () {
		return this.get( OPTION_IGNORE_SAFE_THIS_MUTATIONS );
	}

	/**
	 * @param {boolean} [value=true]
	 * @return {ExecutionPathOptions}
	 */
	setIgnoreSafeThisMutations ( value = true ) {
		return this.set( OPTION_IGNORE_SAFE_THIS_MUTATIONS, value );
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
	 * @param {Node} calledNode
	 * @return {ExecutionPathOptions}
	 */
	getHasEffectsWhenCalledOptions ( calledNode ) {
		return this
			.addCalledNode( calledNode )
			.setIgnoreReturnAwaitYield()
			.setIgnoreBreakStatements( false )
			.setIgnoreNoLabels();
	}
}
