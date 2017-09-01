/** Simple wrapper to make immutability easier */
export default class Options {
	/**
	 * @param [optionValues={}] - Optional initialisation
	 * @returns {Options}
	 */
	static create ( optionValues = {} ) {
		return new this( optionValues );
	}

	constructor ( optionValues ) {
		this._optionValues = optionValues;
	}

	/**
	 * Returns a new Options instance with the given option set to the new value.
	 * Does not mutate the current instance. Also works in sub-classes.
	 * @param {string} option - The name of the option
	 * @param value
	 * @returns {Options} A new options instance
	 */
	set ( option, value ) {
		return this.constructor.create( Object.assign( {}, this._optionValues, { [option]: value } ) );
	}

	get ( option ) {
		return this._optionValues[ option ];
	}
}
