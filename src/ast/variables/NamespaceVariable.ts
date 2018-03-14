import Variable from './Variable';
import { reservedWords } from '../../utils/identifierHelpers';
import Identifier from '../nodes/Identifier';
import Module from '../../Module';
import { RenderOptions } from '../../utils/renderHelpers';

export function isNamespaceVariable(variable: Variable): variable is NamespaceVariable {
	return variable.isNamespace;
}

export default class NamespaceVariable extends Variable {
	isNamespace: true;
	module: Module;
	needsNamespaceBlock: boolean;
	referencedEarly: boolean;
	originals: {
		[name: string]: Variable;
	};
	references: Identifier[];

	constructor(module: Module) {
		super(module.basename());
		this.isNamespace = true;
		this.module = module;
		this.needsNamespaceBlock = false;
		this.referencedEarly = false;

		this.references = null;
		this.originals = Object.create(null);
		this.module
			.getExports()
			.concat(module.getReexports())
			.forEach(name => {
				this.originals[name] = this.module.traceExport(name);
			});
	}

	addReference(identifier: Identifier) {
		this.references = this.references || [];
		this.references.push(identifier);
		this.name = identifier.name;
	}

	includeVariable() {
		if (!super.includeVariable()) {
			return false;
		}
		this.needsNamespaceBlock = true;
		if (this.references) {
			for (const identifier of this.references) {
				if (identifier.module.execIndex <= this.module.execIndex) {
					this.referencedEarly = true;
					break;
				}
			}
		}
		Object.keys(this.originals).forEach(original => this.originals[original].includeVariable());
		return true;
	}

	renderFirst() {
		return this.referencedEarly;
	}

	renderBlock(options: RenderOptions) {
		const members = Object.keys(this.originals).map(name => {
			const original = this.originals[name];

			if ((this.referencedEarly || original.isReassigned) && !options.legacy) {
				return `${options.indent}get ${name} () { return ${original.getName()}; }`;
			}

			if (options.legacy && reservedWords.indexOf(name) !== -1) name = `'${name}'`;
			return `${options.indent}${name}: ${original.getName()}`;
		});

		const name = this.getName();

		const callee = options.freeze
			? `/*#__PURE__*/${options.legacy ? `(Object.freeze || Object)` : `Object.freeze`}`
			: '';

		let output = `${this.module.graph.varOrConst} ${name} = ${
			options.namespaceToStringTag
				? `{\n${members.join(',\n')}\n};`
				: `${callee}({\n${members.join(',\n')}\n});`
		}`;

		if (options.namespaceToStringTag) {
			output += `\nif (typeof Symbol !== 'undefined' && Symbol.toStringTag)
${options.indent}Object.defineProperty(${name}, Symbol.toStringTag, { value: 'Module' });
else
${
				options.indent
			}Object.defineProperty(${name}, 'toString', { value: function () { return '[object Module]' } });
${callee}(${name});`;
		}

		if (options.systemBindings && this.exportName) {
			output += `\nexports('${this.exportName}', ${name});`;
		}

		return output;
	}
}
