import Variable from './Variable';
import { blank, forOwn, keys } from '../../utils/object';
import { reservedWords } from '../../utils/identifierHelpers';
import Identifier from '../nodes/Identifier';
import Module from '../../Module';

export default class NamespaceVariable extends Variable {
	isNamespace: true;
	module: Module;
	needsNamespaceBlock: boolean;

	constructor (module: Module) {
		super(module.basename());
		this.isNamespace = true;
		this.module = module;
		this.needsNamespaceBlock = false;

		this.originals = blank();
		module
			.getExports()
			.concat(module.getReexports())
			.forEach(name => {
				this.originals[name] = module.traceExport(name);
			});
	}

	addReference (identifier: Identifier) {
		this.name = identifier.name;
	}

	includeVariable () {
		if (!super.includeVariable()) {
			return false;
		}
		this.needsNamespaceBlock = true;
		forOwn(this.originals, original => original.includeVariable());
		return true;
	}

	renderBlock (es: boolean, legacy: boolean, freeze: boolean, indentString: boolean) {
		const members = keys(this.originals).map(name => {
			const original = this.originals[name];

			if (original.isReassigned && !legacy) {
				return `${indentString}get ${name} () { return ${original.getName(
					es
				)}; }`;
			}

			if (legacy && ~reservedWords.indexOf(name)) name = `'${name}'`;
			return `${indentString}${name}: ${original.getName(es)}`;
		});

		const callee = freeze
			? legacy ? `(Object.freeze || Object)` : `Object.freeze`
			: '';
		return `${this.module.bundle.varOrConst} ${this.getName(
			es
		)} = ${callee}({\n${members.join(',\n')}\n});\n\n`;
	}
}
