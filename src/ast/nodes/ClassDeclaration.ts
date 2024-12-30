import type MagicString from 'magic-string';
import type { RenderOptions } from '../../utils/renderHelpers';
import { getSystemExportStatement } from '../../utils/systemJsRendering';
import type ChildScope from '../scopes/ChildScope';
import type Variable from '../variables/Variable';
import Identifier, { type IdentifierWithVariable } from './Identifier';
import type * as NodeType from './NodeType';
import ClassNode from './shared/ClassNode';
import type { GenericEsTreeNode } from './shared/Node';

export default class ClassDeclaration extends ClassNode {
	declare id: IdentifierWithVariable | null;
	declare type: NodeType.tClassDeclaration;

	initialise(): void {
		super.initialise();
		if (this.id !== null) {
			this.id.variable.isId = true;
		}
	}

	parseNode(esTreeNode: GenericEsTreeNode): this {
		if (esTreeNode.id !== null) {
			this.id = new Identifier(this, this.scope.parent as ChildScope).parseNode(
				esTreeNode.id
			) as IdentifierWithVariable;
		}
		return super.parseNode(esTreeNode);
	}

	render(code: MagicString, options: RenderOptions): void {
		const {
			exportNamesByVariable,
			format,
			snippets: { _, getPropertyAccess }
		} = options;
		if (this.id) {
			const { variable, name } = this.id;
			if (format === 'system' && exportNamesByVariable.has(variable)) {
				code.appendLeft(this.end, `${_}${getSystemExportStatement([variable], options)};`);
			}
			const renderedVariable = variable.getName(getPropertyAccess);
			if (renderedVariable !== name) {
				this.decorators.map(decorator => decorator.render(code, options));
				this.superClass?.render(code, options);
				this.body.render(code, {
					...options,
					useOriginalName: (_variable: Variable) => _variable === variable
				});
				code.prependRight(this.start, `let ${renderedVariable}${_}=${_}`);
				code.prependLeft(this.end, ';');
				return;
			}
		}
		super.render(code, options);
	}

	applyDeoptimizations() {
		super.applyDeoptimizations();
		const { id, scope } = this;
		if (id) {
			const { name, variable } = id;
			for (const accessedVariable of scope.accessedOutsideVariables.values()) {
				if (accessedVariable !== variable) {
					accessedVariable.forbidName(name);
				}
			}
		}
	}
}
