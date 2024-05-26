use swc_ecma_ast::SwitchCase;

use crate::convert_ast::converter::ast_constants::{
  SWITCH_CASE_CONSEQUENT_OFFSET, SWITCH_CASE_RESERVED_BYTES, SWITCH_CASE_TEST_OFFSET,
  TYPE_SWITCH_CASE,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_switch_case(&mut self, switch_case: &SwitchCase) {
    let end_position = self.add_type_and_start(
      &TYPE_SWITCH_CASE,
      &switch_case.span,
      SWITCH_CASE_RESERVED_BYTES,
      false,
    );
    // test
    if let Some(expression) = switch_case.test.as_ref() {
      self.update_reference_position(end_position + SWITCH_CASE_TEST_OFFSET);
      self.convert_expression(expression)
    }
    // consequent
    self.convert_item_list(
      &switch_case.cons,
      end_position + SWITCH_CASE_CONSEQUENT_OFFSET,
      |ast_converter, statement| {
        ast_converter.convert_statement(statement);
        true
      },
    );
    // end
    self.add_end(end_position, &switch_case.span);
  }
}
