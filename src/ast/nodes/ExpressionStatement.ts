import type MagicString from 'magic-string';
import { LOGLEVEL_WARN } from '../../utils/logging';
import { logModuleLevelDirective } from '../../utils/logs';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { InclusionContext } from '../ExecutionContext';
import * as NodeType from './NodeType';
import {
	doNotDeoptimize,
	type ExpressionNode,
	onlyIncludeSelfNoDeoptimize,
	StatementBase
} from './shared/Node';

export default class ExpressionStatement extends StatementBase {
	declare directive?: string;
	declare expression: ExpressionNode;

	initialise(): void {
		super.initialise();
		if (
			this.directive &&
			this.directive !== 'use strict' &&
			this.parent.type === NodeType.Program
		) {
			this.scope.context.log(
				LOGLEVEL_WARN,
				// This is necessary, because either way (deleting or not) can lead to errors.
				logModuleLevelDirective(this.directive, this.scope.context.module.id),
				this.start
			);
		}
	}

	removeAnnotations(code: MagicString) {
		this.expression.removeAnnotations(code);
	}

	render(code: MagicString, options: RenderOptions): void {
		super.render(code, options);
		if (code.original[this.end - 1] !== ';') {
			code.appendRight(this.end, ';');
		}
	}

	shouldBeIncluded(context: InclusionContext): boolean {
		if (this.directive && this.directive !== 'use strict')
			return this.parent.type !== NodeType.Program;

		return super.shouldBeIncluded(context);
	}
}

ExpressionStatement.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
ExpressionStatement.prototype.applyDeoptimizations = doNotDeoptimize;
