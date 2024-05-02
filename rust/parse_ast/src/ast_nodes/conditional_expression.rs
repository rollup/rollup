use swc_ecma_ast::CondExpr;

use crate::convert_ast::converter::ast_constants::{
  CONDITIONAL_EXPRESSION_ALTERNATE_OFFSET, CONDITIONAL_EXPRESSION_CONSEQUENT_OFFSET,
  CONDITIONAL_EXPRESSION_RESERVED_BYTES, CONDITIONAL_EXPRESSION_TEST_OFFSET,
  TYPE_CONDITIONAL_EXPRESSION,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_conditional_expression(&mut self, conditional_expression: &CondExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_CONDITIONAL_EXPRESSION,
      &conditional_expression.span,
      CONDITIONAL_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // test
    self.update_reference_position(end_position + CONDITIONAL_EXPRESSION_TEST_OFFSET);
    self.convert_expression(&conditional_expression.test);
    // consequent
    self.update_reference_position(end_position + CONDITIONAL_EXPRESSION_CONSEQUENT_OFFSET);
    self.convert_expression(&conditional_expression.cons);
    // alternate
    self.update_reference_position(end_position + CONDITIONAL_EXPRESSION_ALTERNATE_OFFSET);
    self.convert_expression(&conditional_expression.alt);
    // end
    self.add_end(end_position, &conditional_expression.span);
  }
}
