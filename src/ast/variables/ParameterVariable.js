import ReplaceableInitVariable from './ReplaceableInitVariable';

export default class ParameterVariable extends ReplaceableInitVariable {
	constructor ( identifier ) {
		super( identifier.name, identifier );
	}

	getName () {
		return this.name;
	}
}
