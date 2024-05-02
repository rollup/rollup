use swc_ecma_ast::ContinueStmt;

use crate::convert_ast::converter::ast_constants::{
  CONTINUE_STATEMENT_LABEL_OFFSET, CONTINUE_STATEMENT_RESERVED_BYTES, TYPE_CONTINUE_STATEMENT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_continue_statement(&mut self, continue_statement: &ContinueStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_CONTINUE_STATEMENT,
      &continue_statement.span,
      CONTINUE_STATEMENT_RESERVED_BYTES,
      false,
    );
    // label
    if let Some(label) = continue_statement.label.as_ref() {
      self.update_reference_position(end_position + CONTINUE_STATEMENT_LABEL_OFFSET);
      self.convert_identifier(label);
    }
    // end
    self.add_end(end_position, &continue_statement.span);
  }
}
