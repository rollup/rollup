import type MagicString from 'magic-string';
import type { ast } from '../../rollup/types';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { createHasEffectsContext } from '../ExecutionContext';
import type { ObjectPath } from '../utils/PathTracker';
import { UnknownKey } from '../utils/PathTracker';
import type LocalVariable from '../variables/LocalVariable';
import Identifier from './Identifier';
import type Literal from './Literal';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import { Flag, isFlagSet, setFlag } from './shared/BitFlags';
import { type ExpressionEntity } from './shared/Expression';
import type { IncludeChildren } from './shared/Node';
import { doNotDeoptimize, onlyIncludeSelfNoDeoptimize } from './shared/Node';
import type { DeclarationPatternNode } from './shared/Pattern';
import PropertyBase from './shared/PropertyBase';
import type { VariableKind } from './shared/VariableKinds';

export default class Property extends PropertyBase<ast.Property> implements DeclarationPatternNode {
	parent!: nodes.PropertyParent;
	key!: nodes.Expression;
	kind!: ast.Property['kind'];
	type!: NodeType.tProperty;

	//method!: boolean;
	get method(): boolean {
		return isFlagSet(this.flags, Flag.method);
	}
	set method(value: boolean) {
		this.flags = setFlag(this.flags, Flag.method, value);
	}

	//shorthand!: boolean;
	get shorthand(): boolean {
		return isFlagSet(this.flags, Flag.shorthand);
	}
	set shorthand(value: boolean) {
		this.flags = setFlag(this.flags, Flag.shorthand, value);
	}

	declare(
		kind: VariableKind,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): LocalVariable[] {
		return (this.value as DeclarationPatternNode).declare(
			kind,
			this.getPathInProperty(destructuredInitPath),
			init
		);
	}

	deoptimizeAssignment(destructuredInitPath: ObjectPath, init: ExpressionEntity): void {
		(this.value as nodes.DestructuringPattern).deoptimizeAssignment?.(
			this.getPathInProperty(destructuredInitPath),
			init
		);
	}

	hasEffects(context: HasEffectsContext): boolean {
		return this.key.hasEffects(context) || this.value.hasEffects(context);
	}

	hasEffectsWhenDestructuring(
		context: HasEffectsContext,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): boolean {
		return (this.value as nodes.DestructuringPattern).hasEffectsWhenDestructuring?.(
			context,
			this.getPathInProperty(destructuredInitPath),
			init
		);
	}

	includeDestructuredIfNecessary(
		context: InclusionContext,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): boolean {
		const path = this.getPathInProperty(destructuredInitPath);
		let included =
			(this.value as nodes.DestructuringPattern).includeDestructuredIfNecessary(
				context,
				path,
				init
			) || this.included;
		if ((included ||= this.key.hasEffects(createHasEffectsContext()))) {
			this.key.include(context, false);
			if (!this.value.included) {
				this.value.included = true;
				// Unfortunately, we need to include the value again now, so that any
				// declared variables are properly included.
				(this.value as nodes.DestructuringPattern).includeDestructuredIfNecessary(
					context,
					path,
					init
				);
			}
		}
		return (this.included = included);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		this.key.include(context, includeChildrenRecursively);
		this.value.include(context, includeChildrenRecursively);
	}

	includePath(path: ObjectPath, context: InclusionContext) {
		this.included = true;
		this.value.includePath(path, context);
	}

	markDeclarationReached(): void {
		(this.value as DeclarationPatternNode).markDeclarationReached();
	}

	render(code: MagicString, options: RenderOptions): void {
		if (!this.shorthand) {
			this.key.render(code, options);
		}
		this.value.render(code, options, { isShorthandProperty: this.shorthand });
	}

	private getPathInProperty(destructuredInitPath: ObjectPath): ObjectPath {
		return destructuredInitPath.at(-1) === UnknownKey
			? destructuredInitPath
			: // For now, we only consider static paths as we do not know how to
				// deoptimize the path in the dynamic case.
				this.computed
				? [...destructuredInitPath, UnknownKey]
				: this.key instanceof Identifier
					? [...destructuredInitPath, this.key.name]
					: [...destructuredInitPath, String((this.key as Literal).value)];
	}
}

Property.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
Property.prototype.applyDeoptimizations = doNotDeoptimize;
