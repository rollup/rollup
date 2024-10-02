use swc_ecma_ast::DebuggerStmt;

use crate::convert_ast::converter::AstConverter;
use crate::store_debugger_statement;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_debugger_statement(&mut self, debugger_statement: &DebuggerStmt) {
    store_debugger_statement!(self, span => debugger_statement.span);
  }
}
