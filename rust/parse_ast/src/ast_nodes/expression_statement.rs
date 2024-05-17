use swc_ecma_ast::ExprStmt;

use crate::convert_ast::converter::ast_constants::{
  EXPRESSION_STATEMENT_EXPRESSION_OFFSET, EXPRESSION_STATEMENT_RESERVED_BYTES,
  TYPE_EXPRESSION_STATEMENT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_expression_statement(&mut self, expression_statement: &ExprStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_EXPRESSION_STATEMENT,
      &expression_statement.span,
      EXPRESSION_STATEMENT_RESERVED_BYTES,
      false,
    );
    // expression
    self.update_reference_position(end_position + EXPRESSION_STATEMENT_EXPRESSION_OFFSET);
    self.convert_expression(&expression_statement.expr);
    // end
    self.add_end(end_position, &expression_statement.span);
  }
}
