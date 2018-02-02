import { ExpressionNode, NodeBase } from './shared/Node';
import ExportDefaultVariable from '../variables/ExportDefaultVariable';
import ClassDeclaration, { isClassDeclaration } from './ClassDeclaration';
import FunctionDeclaration, { isFunctionDeclaration } from './FunctionDeclaration';
import Identifier from './Identifier';
import MagicString from 'magic-string';
import { NodeType } from './NodeType';
import { NodeRenderOptions, RenderOptions } from '../../Module';

function buildRegexWithSpaces (re: RegExp) {
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

export default class ExportDefaultDeclaration extends NodeBase {
	type: NodeType.ExportDefaultDeclaration;
	declaration: FunctionDeclaration | ClassDeclaration | ExpressionNode;

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

	initialiseNode () {
		this.isExportDeclaration = true;
		this._declarationName =
			((<FunctionDeclaration | ClassDeclaration>this.declaration).id && (<FunctionDeclaration | ClassDeclaration>this.declaration).id.name) ||
			(<Identifier>this.declaration).name;
		this.variable = this.scope.addExportDefaultDeclaration(
			this._declarationName || this.module.basename(),
			this
		);
	}

	render (code: MagicString, options: RenderOptions, nodeRenderOptions: NodeRenderOptions = {}) {
		// paren workaround: find first non-whitespace character position after `export default`
		const declarationStart = this.start + code.original.slice(this.start, this.end).match(sourceRE.exportDefault)[0].length;

		if (isFunctionDeclaration(this.declaration) || isClassDeclaration(this.declaration)) {
			this.renderFunctionOrClassDeclaration(code, declarationStart, this.declaration.id === null, options);
		} else if (this.variable.getOriginalVariableName() === this.variable.getName()) {
			// Remove altogether to prevent re-declaring the same variable
			code.remove(nodeRenderOptions.start || this.start, nodeRenderOptions.end || this.end);
			return;
		} else if (this.variable.included) {
			this.renderVariableDeclaration(code, declarationStart, options);
		} else {
			// Remove `export default`, the rest is rendered for side-effects
			code.remove(this.start, declarationStart);
		}
		super.render(code, options);
	}

	private renderFunctionOrClassDeclaration (code: MagicString, declarationStart: number, needsId: boolean, options: RenderOptions) {
		const name = this.variable.getName();
		// Remove `export default`
		code.remove(this.start, declarationStart);

		if (needsId) {
			const idInsertPos = this.start + code.original.slice(this.start, this.end).match(sourceRE.declarationHeader)[0].length;
			code.appendLeft(idInsertPos, ` ${name}`);
		}
		if (options.systemBindings && isClassDeclaration(this.declaration)) {
			code.appendRight(this.end, ` exports('default', ${name});`);
		}
	}

	private renderVariableDeclaration (code: MagicString, declarationStart: number, options: RenderOptions) {
		const systemBinding = options.systemBindings ? `exports('${this.variable.exportName}', ` : '';
		code.overwrite(
			this.start,
			declarationStart,
			`${this.module.graph.varOrConst} ${this.variable.getName()} = ${systemBinding}`
		);
		if (systemBinding) {
			code.prependRight(this.end - 1, ')');
		}
	}
}
