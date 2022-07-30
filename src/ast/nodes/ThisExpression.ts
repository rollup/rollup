import type MagicString from 'magic-string';
import { errThisIsUndefined } from '../../utils/error';
import type { HasEffectsContext } from '../ExecutionContext';
import type { NodeInteraction, NodeInteractionWithThisArg } from '../NodeInteractions';
import { INTERACTION_ACCESSED } from '../NodeInteractions';
import ModuleScope from '../scopes/ModuleScope';
import type { ObjectPath, PathTracker } from '../utils/PathTracker';
import type Variable from '../variables/Variable';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class ThisExpression extends NodeBase {
	declare type: NodeType.tThisExpression;
	declare variable: Variable;
	private declare alias: string | null;

	bind(): void {
		this.variable = this.scope.findVariable('this');
	}

	deoptimizePath(path: ObjectPath): void {
		this.variable.deoptimizePath(path);
	}

	deoptimizeThisOnInteractionAtPath(
		interaction: NodeInteractionWithThisArg,
		path: ObjectPath,
		recursionTracker: PathTracker
	): void {
		// We rewrite the parameter so that a ThisVariable can detect self-mutations
		this.variable.deoptimizeThisOnInteractionAtPath(
			interaction.thisArg === this ? { ...interaction, thisArg: this.variable } : interaction,
			path,
			recursionTracker
		);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		if (path.length === 0) {
			return interaction.type !== INTERACTION_ACCESSED;
		}
		return this.variable.hasEffectsOnInteractionAtPath(path, interaction, context);
	}

	include(): void {
		if (!this.included) {
			this.included = true;
			this.context.includeVariableInModule(this.variable);
		}
	}

	initialise(): void {
		this.alias =
			this.scope.findLexicalBoundary() instanceof ModuleScope ? this.context.moduleContext : null;
		if (this.alias === 'undefined') {
			this.context.warn(errThisIsUndefined(), this.start);
		}
	}

	render(code: MagicString): void {
		if (this.alias !== null) {
			code.overwrite(this.start, this.end, this.alias, {
				contentOnly: false,
				storeName: true
			});
		}
	}
}
