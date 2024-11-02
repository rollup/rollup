import type { AstContext } from '../../Module';
import type Identifier from '../nodes/Identifier';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import type { VariableKind } from '../nodes/shared/VariableKinds';
import type { ObjectPath } from '../utils/PathTracker';
import type LocalVariable from '../variables/LocalVariable';
import BlockScope from './BlockScope';

export default class TrackingScope extends BlockScope {
	readonly hoistedDeclarations: Identifier[] = [];

	addDeclaration(
		identifier: Identifier,
		context: AstContext,
		init: ExpressionEntity,
		destructuredInitPath: ObjectPath,
		kind: VariableKind
	): LocalVariable {
		this.hoistedDeclarations.push(identifier);
		return super.addDeclaration(identifier, context, init, destructuredInitPath, kind);
	}
}
