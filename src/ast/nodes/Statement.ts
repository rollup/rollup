import { default as StatementBaseClass } from './shared/Statement';
import FunctionDeclaration from './FunctionDeclaration';
import VariableDeclaration from './VariableDeclaration';
import ClassDeclaration from './ClassDeclaration';

type Statement = FunctionDeclaration | VariableDeclaration | ClassDeclaration | StatementBaseClass;
export default Statement;