use swc_ecma_ast::DoWhileStmt;

use crate::convert_ast::converter::ast_constants::{
  DO_WHILE_STATEMENT_BODY_OFFSET, DO_WHILE_STATEMENT_RESERVED_BYTES,
  DO_WHILE_STATEMENT_TEST_OFFSET, TYPE_DO_WHILE_STATEMENT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_do_while_statement(&mut self, do_while_statement: &DoWhileStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_DO_WHILE_STATEMENT,
      &do_while_statement.span,
      DO_WHILE_STATEMENT_RESERVED_BYTES,
      false,
    );
    // body
    self.update_reference_position(end_position + DO_WHILE_STATEMENT_BODY_OFFSET);
    self.convert_statement(&do_while_statement.body);
    // test
    self.update_reference_position(end_position + DO_WHILE_STATEMENT_TEST_OFFSET);
    self.convert_expression(&do_while_statement.test);
    // end
    self.add_end(end_position, &do_while_statement.span);
  }
}
