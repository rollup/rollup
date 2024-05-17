use swc_ecma_ast::ForStmt;

use crate::convert_ast::converter::ast_constants::{
  FOR_STATEMENT_BODY_OFFSET, FOR_STATEMENT_INIT_OFFSET, FOR_STATEMENT_RESERVED_BYTES,
  FOR_STATEMENT_TEST_OFFSET, FOR_STATEMENT_UPDATE_OFFSET, TYPE_FOR_STATEMENT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_for_statement(&mut self, for_statement: &ForStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_FOR_STATEMENT,
      &for_statement.span,
      FOR_STATEMENT_RESERVED_BYTES,
      false,
    );
    // init
    if let Some(init) = for_statement.init.as_ref() {
      self.update_reference_position(end_position + FOR_STATEMENT_INIT_OFFSET);
      self.convert_variable_declaration_or_expression(init);
    }
    // test
    if let Some(test) = for_statement.test.as_ref() {
      self.update_reference_position(end_position + FOR_STATEMENT_TEST_OFFSET);
      self.convert_expression(test);
    }
    // update
    if let Some(update) = for_statement.update.as_ref() {
      self.update_reference_position(end_position + FOR_STATEMENT_UPDATE_OFFSET);
      self.convert_expression(update);
    }
    // body
    self.update_reference_position(end_position + FOR_STATEMENT_BODY_OFFSET);
    self.convert_statement(&for_statement.body);
    // end
    self.add_end(end_position, &for_statement.span);
  }
}
