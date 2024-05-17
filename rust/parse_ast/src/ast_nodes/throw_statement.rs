use swc_ecma_ast::ThrowStmt;

use crate::convert_ast::converter::ast_constants::{
  THROW_STATEMENT_ARGUMENT_OFFSET, THROW_STATEMENT_RESERVED_BYTES, TYPE_THROW_STATEMENT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_throw_statement(&mut self, throw_statement: &ThrowStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_THROW_STATEMENT,
      &throw_statement.span,
      THROW_STATEMENT_RESERVED_BYTES,
      false,
    );
    // argument
    self.update_reference_position(end_position + THROW_STATEMENT_ARGUMENT_OFFSET);
    self.convert_expression(&throw_statement.arg);
    // end
    self.add_end(end_position, &throw_statement.span);
  }
}
