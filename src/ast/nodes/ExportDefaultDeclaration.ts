import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import {
	findFirstOccurrenceOutsideComment,
	NodeRenderOptions,
	RenderOptions
} from '../../utils/renderHelpers';
import { treeshakeNode } from '../../utils/treeshakeNode';
import ModuleScope from '../scopes/ModuleScope';
import ExportDefaultVariable from '../variables/ExportDefaultVariable';
import ClassDeclaration, { isClassDeclaration } from './ClassDeclaration';
import FunctionDeclaration, { isFunctionDeclaration } from './FunctionDeclaration';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { ExpressionNode, Node, NodeBase } from './shared/Node';

const WHITESPACE = /\s/;

// The header ends at the first non-white-space after "default"
function getDeclarationStart(code: string, start = 0) {
	start = findFirstOccurrenceOutsideComment(code, 'default', start) + 7;
	while (WHITESPACE.test(code[start])) start++;
	return start;
}

function getIdInsertPosition(code: string, declarationKeyword: string, start = 0) {
	const declarationEnd =
		findFirstOccurrenceOutsideComment(code, declarationKeyword, start) + declarationKeyword.length;
	code = code.slice(declarationEnd, findFirstOccurrenceOutsideComment(code, '{', declarationEnd));
	const generatorStarPos = findFirstOccurrenceOutsideComment(code, '*');
	if (generatorStarPos === -1) {
		return declarationEnd;
	}
	return declarationEnd + generatorStarPos + 1;
}

export function isExportDefaultDeclaration(node: Node): node is ExportDefaultDeclaration {
	return node.type === NodeType.ExportDefaultDeclaration;
}

export default class ExportDefaultDeclaration extends NodeBase {
	declaration: FunctionDeclaration | ClassDeclaration | ExpressionNode;
	needsBoundaries: true;
	scope: ModuleScope;
	type: NodeType.tExportDefaultDeclaration;
	variable: ExportDefaultVariable;

	private declarationName: string;

	include(includeAllChildrenRecursively: boolean) {
		super.include(includeAllChildrenRecursively);
		if (includeAllChildrenRecursively) {
			this.context.includeVariable(this.variable);
		}
	}

	initialise() {
		this.included = false;
		this.declarationName =
			((<FunctionDeclaration | ClassDeclaration>this.declaration).id &&
				(<FunctionDeclaration | ClassDeclaration>this.declaration).id.name) ||
			(<Identifier>this.declaration).name;
		this.variable = this.scope.addExportDefaultDeclaration(
			this.declarationName || this.context.getModuleName(),
			this,
			this.context
		);
		this.context.addExport(this);
	}

	render(code: MagicString, options: RenderOptions, { start, end }: NodeRenderOptions = BLANK) {
		const declarationStart = getDeclarationStart(code.original, this.start);

		if (isFunctionDeclaration(this.declaration)) {
			this.renderNamedDeclaration(
				code,
				declarationStart,
				'function',
				this.declaration.id === null,
				options
			);
		} else if (isClassDeclaration(this.declaration)) {
			this.renderNamedDeclaration(
				code,
				declarationStart,
				'class',
				this.declaration.id === null,
				options
			);
		} else if (this.variable.referencesOriginal()) {
			// Remove altogether to prevent re-declaring the same variable
			if (options.format === 'system' && this.variable.exportName) {
				code.overwrite(
					start,
					end,
					`exports('${this.variable.exportName}', ${this.variable.getName()});`
				);
			} else {
				treeshakeNode(this, code, start, end);
			}
			return;
		} else if (this.variable.included) {
			this.renderVariableDeclaration(code, declarationStart, options);
		} else {
			code.remove(this.start, declarationStart);
			this.declaration.render(code, options, {
				isCalleeOfRenderedParent: false,
				renderedParentType: NodeType.ExpressionStatement
			});
			if (code.original[this.end - 1] !== ';') {
				code.appendLeft(this.end, ';');
			}
			return;
		}
		this.declaration.render(code, options);
	}

	private renderNamedDeclaration(
		code: MagicString,
		declarationStart: number,
		declarationKeyword: string,
		needsId: boolean,
		options: RenderOptions
	) {
		const name = this.variable.getName();
		// Remove `export default`
		code.remove(this.start, declarationStart);

		if (needsId) {
			code.appendLeft(
				getIdInsertPosition(code.original, declarationKeyword, declarationStart),
				` ${name}`
			);
		}
		if (
			options.format === 'system' &&
			isClassDeclaration(this.declaration) &&
			this.variable.exportName
		) {
			code.appendLeft(this.end, ` exports('${this.variable.exportName}', ${name});`);
		}
	}

	private renderVariableDeclaration(
		code: MagicString,
		declarationStart: number,
		options: RenderOptions
	) {
		const systemBinding =
			options.format === 'system' && this.variable.exportName
				? `exports('${this.variable.exportName}', `
				: '';
		code.overwrite(
			this.start,
			declarationStart,
			`${options.varOrConst} ${this.variable.getName()} = ${systemBinding}`
		);
		const hasTrailingSemicolon = code.original.charCodeAt(this.end - 1) === 59; /*";"*/
		if (systemBinding) {
			code.appendRight(
				hasTrailingSemicolon ? this.end - 1 : this.end,
				')' + (hasTrailingSemicolon ? '' : ';')
			);
		} else if (!hasTrailingSemicolon) {
			code.appendLeft(this.end, ';');
		}
	}
}

ExportDefaultDeclaration.prototype.needsBoundaries = true;
