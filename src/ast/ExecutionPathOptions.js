const OPTION_IGNORE_BREAK_STATEMENTS = 'IGNORE_BREAK_STATEMENTS';
const OPTION_IGNORE_RETURN_AWAIT_YIELD = 'IGNORE_RETURN_AWAIT_YIELD';

/** Wrapper to ensure immutability */
export default class ExecutionPathOptions {
	/**
	 * @returns {ExecutionPathOptions}
	 */
	static create () {
		return new this( {} );
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
		return new this.constructor( Object.assign( {}, this._optionValues, { [option]: value } ) );
	}

	/**
	 * @param {string} option - The name of an option
	 * @returns {*} Its value
	 */
	get ( option ) {
		return this._optionValues[ option ];
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
}
