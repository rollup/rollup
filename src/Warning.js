import relativeId from './utils/relativeId.js';

export default class Warning {
	static createFrom(object) {
		if (object instanceof Warning)
			return object;
		else
			return Object.assign(new Warning(), object);
	}

	constructor() {
	}

	toString () {
		let str = '';

		if (this.plugin) str += `(${this.plugin} plugin) `;
		if (this.loc) str += `${relativeId(this.loc.file)} (${this.loc.line}:${this.loc.column}) `;
		str += this.message;

		return str;
	}

	static print(warning) {
		warning = Warning.createFrom(warning);
		
		const str = warning.toString();
		if (Warning.onwarn)
			Warning.onwarn(warning);
		else 
			console.warn(str); //eslint-disable-line no-console
	}
}