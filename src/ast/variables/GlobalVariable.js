import Variable from './Variable';
import pureFunctions from '../nodes/shared/pureFunctions';

export default class GlobalVariable extends Variable {
	constructor ( name ) {
		super( name );
		this.isExternal = true;
		this.isGlobal = true;
		this.isReassigned = false;
		this.included = true;
	}

	addReference ( reference ) {
		if ( reference.isReassignment ) this.isReassigned = true;
	}

	hasEffectsWhenCalled () {
		return !pureFunctions[ this.name ];
	}
}
