import type MagicString from 'magic-string';
import { LOGLEVEL_WARN } from '../../utils/logging';
import { logThisIsUndefined } from '../../utils/logs';
import type { HasEffectsContext } from '../ExecutionContext';
import type { NodeInteraction } from '../NodeInteractions';
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

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: PathTracker
	): void {
		this.variable.deoptimizeArgumentsOnInteractionAtPath(interaction, path, recursionTracker);
	}

	deoptimizePath(path: ObjectPath): void {
		this.variable.deoptimizePath(path);
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

	includePath(): void {
		if (!this.included) {
			this.included = true;
			this.scope.context.includeVariableInModule(this.variable);
		}
	}

	initialise(): void {
		super.initialise();
		this.alias =
			this.scope.findLexicalBoundary() instanceof ModuleScope
				? this.scope.context.moduleContext
				: null;
		if (this.alias === 'undefined') {
			this.scope.context.log(LOGLEVEL_WARN, logThisIsUndefined(), this.start);
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
