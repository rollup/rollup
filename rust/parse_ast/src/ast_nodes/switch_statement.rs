use swc_ecma_ast::SwitchStmt;

use crate::convert_ast::converter::ast_constants::{
  NODE_TYPE_ID_SWITCH_STATEMENT, SWITCH_STATEMENT_CASES_OFFSET,
  SWITCH_STATEMENT_DISCRIMINANT_OFFSET, SWITCH_STATEMENT_RESERVED_BYTES,
  SWITCH_STATEMENT_SCOPE_OFFSET_OFFSET, TYPE_SWITCH_STATEMENT,
};
use crate::convert_ast::converter::{AstConverter, ScopeType};

impl AstConverter<'_> {
  pub(crate) fn store_switch_statement(&mut self, switch_statement: &SwitchStmt) {
    let walk_entry = self.on_node_enter::<NODE_TYPE_ID_SWITCH_STATEMENT>();
    let end_position = self.add_type_and_start(
      &TYPE_SWITCH_STATEMENT,
      &switch_statement.span,
      SWITCH_STATEMENT_RESERVED_BYTES,
      false,
    );
    self.update_reference_position(end_position + SWITCH_STATEMENT_DISCRIMINANT_OFFSET);
    self.convert_expression(&switch_statement.discriminant);
    self.push_scope(
      ScopeType::Block,
      end_position + SWITCH_STATEMENT_SCOPE_OFFSET_OFFSET,
    );
    self.convert_item_list(
      &switch_statement.cases,
      end_position + SWITCH_STATEMENT_CASES_OFFSET,
      |ast_converter, switch_case| {
        ast_converter.store_switch_case(switch_case);
        true
      },
    );
    self.add_end(end_position, &switch_statement.span);
    self.pop_scope();
    self.on_node_exit(walk_entry);
  }
}
