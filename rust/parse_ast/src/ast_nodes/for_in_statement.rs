use swc_ecma_ast::ForInStmt;

use crate::convert_ast::converter::ast_constants::{
  FOR_IN_STATEMENT_BODY_OFFSET, FOR_IN_STATEMENT_LEFT_OFFSET, FOR_IN_STATEMENT_RESERVED_BYTES,
  FOR_IN_STATEMENT_RIGHT_OFFSET, TYPE_FOR_IN_STATEMENT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_for_in_statement(&mut self, for_in_statement: &ForInStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_FOR_IN_STATEMENT,
      &for_in_statement.span,
      FOR_IN_STATEMENT_RESERVED_BYTES,
      false,
    );
    // left
    self.update_reference_position(end_position + FOR_IN_STATEMENT_LEFT_OFFSET);
    self.convert_for_head(&for_in_statement.left);
    // right
    self.update_reference_position(end_position + FOR_IN_STATEMENT_RIGHT_OFFSET);
    self.convert_expression(&for_in_statement.right);
    // body
    self.update_reference_position(end_position + FOR_IN_STATEMENT_BODY_OFFSET);
    self.convert_statement(&for_in_statement.body);
    // end
    self.add_end(end_position, &for_in_statement.span);
  }
}
