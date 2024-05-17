use swc_ecma_ast::BreakStmt;

use crate::convert_ast::converter::ast_constants::{
  BREAK_STATEMENT_LABEL_OFFSET, BREAK_STATEMENT_RESERVED_BYTES, TYPE_BREAK_STATEMENT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_break_statement(&mut self, break_statement: &BreakStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_BREAK_STATEMENT,
      &break_statement.span,
      BREAK_STATEMENT_RESERVED_BYTES,
      false,
    );
    // label
    if let Some(label) = break_statement.label.as_ref() {
      self.update_reference_position(end_position + BREAK_STATEMENT_LABEL_OFFSET);
      self.convert_identifier(label);
    }
    // end
    self.add_end(end_position, &break_statement.span);
  }
}
