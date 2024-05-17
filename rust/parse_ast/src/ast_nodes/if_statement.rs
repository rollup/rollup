use swc_ecma_ast::IfStmt;

use crate::convert_ast::converter::ast_constants::{
  IF_STATEMENT_ALTERNATE_OFFSET, IF_STATEMENT_CONSEQUENT_OFFSET, IF_STATEMENT_RESERVED_BYTES,
  IF_STATEMENT_TEST_OFFSET, TYPE_IF_STATEMENT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_if_statement(&mut self, if_statement: &IfStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_IF_STATEMENT,
      &if_statement.span,
      IF_STATEMENT_RESERVED_BYTES,
      false,
    );
    // test
    self.update_reference_position(end_position + IF_STATEMENT_TEST_OFFSET);
    self.convert_expression(&if_statement.test);
    // consequent
    self.update_reference_position(end_position + IF_STATEMENT_CONSEQUENT_OFFSET);
    self.convert_statement(&if_statement.cons);
    // alternate
    if let Some(alt) = if_statement.alt.as_ref() {
      self.update_reference_position(end_position + IF_STATEMENT_ALTERNATE_OFFSET);
      self.convert_statement(alt);
    }
    // end
    self.add_end(end_position, &if_statement.span);
  }
}
