import GlobalVariable from '../variables/GlobalVariable';
import UndefinedVariable from '../variables/UndefinedVariable';
import Scope from './Scope';

export default class GlobalScope extends Scope {
	parent: null;

	constructor() {
		super();
		this.variables.undefined = new UndefinedVariable();
	}

	findVariable(name: string) {
		if (!this.variables[name]) return (this.variables[name] = new GlobalVariable(name));
		return this.variables[name] as GlobalVariable;
	}

	deshadow(names: Set<string>, children = this.children) {
		super.deshadow(names, children);
	}
}
