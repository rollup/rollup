use swc_ecma_ast::DebuggerStmt;

use crate::convert_ast::converter::ast_constants::{
  DEBUGGER_STATEMENT_RESERVED_BYTES, TYPE_DEBUGGER_STATEMENT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_debugger_statement(&mut self, debugger_statement: &DebuggerStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_DEBUGGER_STATEMENT,
      &debugger_statement.span,
      DEBUGGER_STATEMENT_RESERVED_BYTES,
      false,
    );
    self.add_end(end_position, &debugger_statement.span);
  }
}
