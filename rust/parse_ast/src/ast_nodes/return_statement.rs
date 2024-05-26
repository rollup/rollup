use swc_ecma_ast::ReturnStmt;

use crate::convert_ast::converter::ast_constants::{
  RETURN_STATEMENT_ARGUMENT_OFFSET, RETURN_STATEMENT_RESERVED_BYTES, TYPE_RETURN_STATEMENT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_return_statement(&mut self, return_statement: &ReturnStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_RETURN_STATEMENT,
      &return_statement.span,
      RETURN_STATEMENT_RESERVED_BYTES,
      false,
    );
    // argument
    if let Some(argument) = return_statement.arg.as_ref() {
      self.update_reference_position(end_position + RETURN_STATEMENT_ARGUMENT_OFFSET);
      self.convert_expression(argument)
    }
    // end
    self.add_end(end_position, &return_statement.span);
  }
}
