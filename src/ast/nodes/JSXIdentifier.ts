import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import { LOGLEVEL_WARN } from '../../utils/logging';
import { logThisIsUndefined } from '../../utils/logs';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { InclusionContext } from '../ExecutionContext';
import ModuleScope from '../scopes/ModuleScope';
import type { ObjectPath } from '../utils/PathTracker';
import { EMPTY_PATH } from '../utils/PathTracker';
import type JSXMemberExpression from './JSXMemberExpression';
import type * as NodeType from './NodeType';
import IdentifierBase from './shared/IdentifierBase';

const enum IdentifierType {
	Reference,
	NativeElementName,
	Other
}

export default class JSXIdentifier extends IdentifierBase {
	declare type: NodeType.tJSXIdentifier;
	declare name: string;

	private isNativeElement = false;
	private thisAlias: string | null = null;

	bind(): void {
		const type = this.getType();
		if (type === IdentifierType.Reference) {
			this.variable = this.scope.findVariable(this.name);
			this.variable.addReference(this);
			if (this.name === 'this') {
				this.initialiseThisAlias();
			}
		} else if (type === IdentifierType.NativeElementName) {
			this.isNativeElement = true;
		}
	}

	include(context: InclusionContext): void {
		if (!this.included) this.includeNode(context);
	}

	includeNode(context: InclusionContext) {
		this.included = true;
		if (!this.deoptimized) this.applyDeoptimizations();
		if (this.variable !== null) {
			this.scope.context.includeVariableInModule(this.variable, EMPTY_PATH, context);
		}
	}

	includePath(path: ObjectPath, context: InclusionContext): void {
		if (!this.included) {
			this.included = true;
			if (this.variable !== null) {
				this.scope.context.includeVariableInModule(this.variable, path, context);
			}
		} else if (path.length > 0) {
			this.variable?.includePath(path, context);
		}
	}

	render(
		code: MagicString,
		{ snippets: { getPropertyAccess }, useOriginalName }: RenderOptions
	): void {
		if (this.variable) {
			const name =
				this.name === 'this'
					? (this.thisAlias ?? this.name)
					: this.variable.getName(getPropertyAccess, useOriginalName);

			if (name !== this.name) {
				code.overwrite(this.start, this.end, name, {
					contentOnly: true,
					storeName: true
				});
			}
		} else if (
			this.isNativeElement &&
			(this.scope.context.options.jsx as NormalizedJsxOptions).mode !== 'preserve'
		) {
			code.update(this.start, this.end, JSON.stringify(this.name));
		}
	}

	private initialiseThisAlias(): void {
		if (this.scope.findLexicalBoundary() instanceof ModuleScope) {
			this.thisAlias = this.scope.context.moduleContext;
			if (this.thisAlias === 'undefined') {
				this.scope.context.log(LOGLEVEL_WARN, logThisIsUndefined(), this.start);
			}
		}
	}

	private getType(): IdentifierType {
		switch (this.parent.type) {
			case 'JSXOpeningElement':
			case 'JSXClosingElement': {
				return this.name.startsWith(this.name.charAt(0).toUpperCase())
					? IdentifierType.Reference
					: IdentifierType.NativeElementName;
			}
			case 'JSXMemberExpression': {
				return (this.parent as JSXMemberExpression).object === this
					? IdentifierType.Reference
					: IdentifierType.Other;
			}
			case 'JSXAttribute':
			case 'JSXNamespacedName': {
				return IdentifierType.Other;
			}
			default: {
				/* istanbul ignore next */
				throw new Error(`Unexpected parent node type for JSXIdentifier: ${this.parent.type}`);
			}
		}
	}
}
