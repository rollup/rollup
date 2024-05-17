use swc_ecma_ast::WhileStmt;

use crate::convert_ast::converter::ast_constants::{
  TYPE_WHILE_STATEMENT, WHILE_STATEMENT_BODY_OFFSET, WHILE_STATEMENT_RESERVED_BYTES,
  WHILE_STATEMENT_TEST_OFFSET,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_while_statement(&mut self, while_statement: &WhileStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_WHILE_STATEMENT,
      &while_statement.span,
      WHILE_STATEMENT_RESERVED_BYTES,
      false,
    );
    // test
    self.update_reference_position(end_position + WHILE_STATEMENT_TEST_OFFSET);
    self.convert_expression(&while_statement.test);
    // body
    self.update_reference_position(end_position + WHILE_STATEMENT_BODY_OFFSET);
    self.convert_statement(&while_statement.body);
    // end
    self.add_end(end_position, &while_statement.span);
  }
}
