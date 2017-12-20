import Node from '../Node';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Declaration from '../Declaration';
import Expression from './Expression';
import ExportDefaultVariable from '../variables/ExportDefaultVariable';

const functionOrClassDeclaration = /^(?:Function|Class)Declaration/;

function buildRegexWithSpaces (re) {
	const spaceOrComment =
		'(?:' +
		[
			/\s/.source, // Space
			/\/\/.*[\n\r]/.source, // Single line comment
			/\/\*[^]*?\*\//.source // Multiline comment. There is [^] instead of . because it also matches \n
		].join('|') +
		')';
	return new RegExp(re.source.replace(/\s|\\s/g, spaceOrComment), re.flags);
}

const sourceRE = {
	exportDefault: buildRegexWithSpaces(/^ *export +default */),
	declarationHeader: buildRegexWithSpaces(
		/^ *export +default +(?:(?:async +)?function(?: *\*)?|class)/
	)
};

export default class ExportDefaultDeclaration extends Node {
	type: 'ExportDefaultDeclaration';
	declaration: Declaration | Expression;

	private _declarationName: string;
	isExportDeclaration: true;
	variable: ExportDefaultVariable;

	bindNode () {
		if (this._declarationName) {
			this.variable.setOriginalVariable(
				this.scope.findVariable(this._declarationName)
			);
		}
	}

	includeDefaultExport () {
		this.included = true;
		this.declaration.includeInBundle();
	}

	includeInBundle () {
		if (this.declaration.shouldBeIncluded()) {
			return this.declaration.includeInBundle();
		}
		return false;
	}

	initialiseNode () {
		this.isExportDeclaration = true;
		this._declarationName =
			((<Declaration>this.declaration).id && (<Declaration>this.declaration).id.name) ||
			this.declaration.name;
		this.variable = this.scope.addExportDefaultDeclaration(
			this._declarationName || this.module.basename(),
			this
		);
	}

	render (code, es) {
		const remove = () => { code.remove(this.leadingCommentStart || this.start, this.next || this.end); };
		const removeExportDefault = () => { code.remove(this.start, declaration_start); };

		const treeshakeable = this.module.bundle.treeshake && !this.included && !this.declaration.included;
		const name = this.variable.getName(es);
		const statementStr = code.original.slice(this.start, this.end);

		// paren workaround: find first non-whitespace character position after `export default`
		const declaration_start =
			this.start + statementStr.match(sourceRE.exportDefault)[0].length;

		if (functionOrClassDeclaration.test(this.declaration.type)) {
			if (treeshakeable) {
				return remove();
			}

			// Add the id to anonymous declarations
			if (!this.declaration.id) {
				const id_insertPos =
					this.start + statementStr.match(sourceRE.declarationHeader)[0].length;
				code.appendLeft(id_insertPos, ` ${name}`);
			}

			removeExportDefault();
		} else {
			if (treeshakeable) {
				const hasEffects = this.declaration.hasEffects(
					ExecutionPathOptions.create()
				);
				return hasEffects ? removeExportDefault() : remove();
			}

			// Prevent `var foo = foo`
			if (this.variable.getOriginalVariableName(es) === name) {
				return remove();
			}

			// Only output `var foo =` if `foo` is used
			if (this.included) {
				code.overwrite(
					this.start,
					declaration_start,
					`${this.module.bundle.varOrConst} ${name} = `
				);
			} else {
				removeExportDefault();
			}
		}
		super.render(code, es);

	}
}
