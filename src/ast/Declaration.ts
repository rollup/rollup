import FunctionDeclaration from "./nodes/FunctionDeclaration";
import VariableDeclaration from "./nodes/VariableDeclaration";
import ClassDeclaration from "./nodes/ClassDeclaration";

type Declaration = FunctionDeclaration | VariableDeclaration | ClassDeclaration;

export default Declaration;