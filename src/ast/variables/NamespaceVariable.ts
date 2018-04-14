import Variable from './Variable';
import { reservedWords } from '../../utils/identifierHelpers';
import Identifier from '../nodes/Identifier';
import { AstContext } from '../../Module';
import { RenderOptions } from '../../utils/renderHelpers';

export default class NamespaceVariable extends Variable {
	isNamespace: true;
	context: AstContext;

	// Not initialised during construction
	originals: { [name: string]: Variable } = Object.create(null);
	needsNamespaceBlock: boolean = false;
	private referencedEarly: boolean = false;
	private references: Identifier[] = [];

	constructor(context: AstContext) {
		super(context.getModuleName());
		this.context = context;
		for (const name of this.context.getExports().concat(this.context.getReexports())) {
			this.originals[name] = this.context.traceExport(name);
		}
	}

	addReference(identifier: Identifier) {
		this.references.push(identifier);
		this.name = identifier.name;
	}

	include() {
		if (!this.included) {
			this.included = true;
			this.needsNamespaceBlock = true;
			for (const identifier of this.references) {
				if (identifier.context.getModuleExecIndex() <= this.context.getModuleExecIndex()) {
					this.referencedEarly = true;
					break;
				}
			}
			for (const original of Object.keys(this.originals)) this.originals[original].include();
		}
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

		let output = `${this.context.varOrConst} ${name} = ${
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

NamespaceVariable.prototype.isNamespace = true;
