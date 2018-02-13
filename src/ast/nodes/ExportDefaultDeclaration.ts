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

const WHITESPACE = /\s/;

// The header ends at the first non-white-space after "default"
function getDeclarationStart (code: string, start = 0) {
	start = findFirstOccurrenceOutsideComment(code, 'default', start) + 7;
	while (WHITESPACE.test(code[start])) start++;
	return start;
}

function getIdInsertPosition (code: string, declarationKeyword: string, start = 0) {
	const declarationEnd = findFirstOccurrenceOutsideComment(code, declarationKeyword, start) + declarationKeyword.length;
	code = code.slice(declarationEnd, findFirstOccurrenceOutsideComment(code, '{', declarationEnd));
	const generatorStarPos = findFirstOccurrenceOutsideComment(code, '*');
	if (generatorStarPos === -1) {
		return declarationEnd;
	}
	return declarationEnd + generatorStarPos + 1;
}

const needsToBeWrapped = isObjectExpression;

export default class ExportDefaultDeclaration extends NodeBase {
	type: NodeType.ExportDefaultDeclaration;
	declaration: FunctionDeclaration | ClassDeclaration | ExpressionNode;
	needsBoundaries: true;

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
		this.needsBoundaries = true;
		this._declarationName =
			((<FunctionDeclaration | ClassDeclaration>this.declaration).id && (<FunctionDeclaration | ClassDeclaration>this.declaration).id.name) ||
			(<Identifier>this.declaration).name;
		this.variable = this.scope.addExportDefaultDeclaration(
			this._declarationName || this.module.basename(),
			this
		);
	}

	render (code: MagicString, options: RenderOptions, { start, end }: NodeRenderOptions = {}) {
		const declarationStart = getDeclarationStart(code.original, this.start);

		if (isFunctionDeclaration(this.declaration)) {
			this.renderNamedDeclaration(code, declarationStart, 'function', this.declaration.id === null, options);
		} else if (isClassDeclaration(this.declaration)) {
			this.renderNamedDeclaration(code, declarationStart, 'class', this.declaration.id === null, options);
		} else if (this.variable.getOriginalVariableName() === this.variable.getName()) {
			// Remove altogether to prevent re-declaring the same variable
			code.remove(start, end);
			return;
		} else if (this.variable.included) {
			this.renderVariableDeclaration(code, declarationStart, options);
		} else {
			this.renderForSideEffectsOnly(code, declarationStart);
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
			code.appendLeft(getIdInsertPosition(code.original, declarationKeyword, declarationStart), ` ${name}`);
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

	private renderForSideEffectsOnly (code: MagicString, declarationStart: number) {
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
