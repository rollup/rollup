import { default as StatementBaseClass } from './shared/Statement';
import FunctionDeclaration from './FunctionDeclaration';
import VariableDeclaration from './VariableDeclaration';

type Statement = FunctionDeclaration | VariableDeclaration | ClassDeclaration | StatementBaseClass;
export default Statement;