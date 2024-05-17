use swc_ecma_ast::SwitchStmt;

use crate::convert_ast::converter::ast_constants::{
  SWITCH_STATEMENT_CASES_OFFSET, SWITCH_STATEMENT_DISCRIMINANT_OFFSET,
  SWITCH_STATEMENT_RESERVED_BYTES, TYPE_SWITCH_STATEMENT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_switch_statement(&mut self, switch_statement: &SwitchStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_SWITCH_STATEMENT,
      &switch_statement.span,
      SWITCH_STATEMENT_RESERVED_BYTES,
      false,
    );
    // discriminant
    self.update_reference_position(end_position + SWITCH_STATEMENT_DISCRIMINANT_OFFSET);
    self.convert_expression(&switch_statement.discriminant);
    // cases
    self.convert_item_list(
      &switch_statement.cases,
      end_position + SWITCH_STATEMENT_CASES_OFFSET,
      |ast_converter, switch_case| {
        ast_converter.store_switch_case(switch_case);
        true
      },
    );
    // end
    self.add_end(end_position, &switch_statement.span);
  }
}
