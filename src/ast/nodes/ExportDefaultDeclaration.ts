import { ExpressionNode, NodeBase } from './shared/Node';
import ExportDefaultVariable from '../variables/ExportDefaultVariable';
import ClassDeclaration, { isClassDeclaration } from './ClassDeclaration';
import FunctionDeclaration, { isFunctionDeclaration } from './FunctionDeclaration';
import Identifier from './Identifier';
import MagicString from 'magic-string';
import { NodeType } from './NodeType';
import { NodeRenderOptions, RenderOptions } from '../../Module';
import { findFirstOccurrenceOutsideComment } from '../../utils/renderHelpers';
import { isObjectExpression } from './ObjectExpression';

// The header ends at the first white-space or comment after "default"
function getDeclarationStart (code: string) {
	const headerLength = findFirstOccurrenceOutsideComment(code, 'default') + 7;
	return headerLength + code.slice(headerLength).search(/\S|\/\*/);
}

function getIdInsertPosition (code: string, declarationKeyword: string) {
	const declarationEnd = findFirstOccurrenceOutsideComment(code, declarationKeyword) + declarationKeyword.length;
	code = code.slice(declarationEnd);
	code = code.slice(0, findFirstOccurrenceOutsideComment(code, '{'));
	const generatorStarPos = findFirstOccurrenceOutsideComment(code, '*');
	if (generatorStarPos === 0) {
		return declarationEnd + (code[0] === '*' ? 1 : 0);
	}
	return declarationEnd + generatorStarPos + 1;
}

const needsToBeWrapped = isObjectExpression;

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

	render (code: MagicString, options: RenderOptions, { start, end }: NodeRenderOptions = {}) {
		const declarationStart = this.start + getDeclarationStart(code.original.slice(this.start, this.end));

		if (isFunctionDeclaration(this.declaration)) {
			this.renderNamedDeclaration(code, declarationStart, 'function', this.declaration.id === null, options);
		} else if (isClassDeclaration(this.declaration)) {
			this.renderNamedDeclaration(code, declarationStart, 'class', this.declaration.id === null, options);
		} else if (this.variable.getOriginalVariableName() === this.variable.getName()) {
			// Remove altogether to prevent re-declaring the same variable
			code.remove(start || this.start, end || this.end);
			return;
		} else if (this.variable.included) {
			this.renderVariableDeclaration(code, declarationStart, options);
		} else {
			this.renderForSideEffects(code, declarationStart);
		}
		super.render(code, options);
	}

	private renderNamedDeclaration (
		code: MagicString, declarationStart: number, declarationKeyword: string, needsId: boolean, options: RenderOptions
	) {
		const name = this.variable.getName();
		// Remove `export default`
		code.remove(this.start, declarationStart);

		if (needsId) {
			const idInsertPos = declarationStart + getIdInsertPosition(code.original.slice(declarationStart, this.end), declarationKeyword);
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

	private renderForSideEffects (code: MagicString, declarationStart: number) {
		code.remove(this.start, declarationStart);
		if (needsToBeWrapped(this.declaration)) {
			code.appendLeft(declarationStart, '(');
			if (code.original[this.end - 1] === ';') {
				code.prependRight(this.end - 1, ')');
			} else {
				code.prependRight(this.end, ');');
			}
		}
	}
}
