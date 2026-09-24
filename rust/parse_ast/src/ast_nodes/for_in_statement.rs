use swc_ecma_ast::ForInStmt;

use crate::convert_ast::converter::ast_constants::{
  FOR_IN_STATEMENT_BODY_OFFSET, FOR_IN_STATEMENT_LEFT_OFFSET, FOR_IN_STATEMENT_RESERVED_BYTES,
  FOR_IN_STATEMENT_RIGHT_OFFSET, FOR_IN_STATEMENT_SCOPE_OFFSET_OFFSET,
  NODE_TYPE_ID_FOR_IN_STATEMENT, TYPE_FOR_IN_STATEMENT,
};
use crate::convert_ast::converter::{AstConverter, ScopeType};

impl AstConverter<'_> {
  pub(crate) fn store_for_in_statement(&mut self, for_in_statement: &ForInStmt) {
    let walk_entry = self.on_node_enter::<NODE_TYPE_ID_FOR_IN_STATEMENT>();
    let end_position = self.add_type_and_start(
      &TYPE_FOR_IN_STATEMENT,
      &for_in_statement.span,
      FOR_IN_STATEMENT_RESERVED_BYTES,
      false,
    );
    self.push_scope(
      ScopeType::Block,
      end_position + FOR_IN_STATEMENT_SCOPE_OFFSET_OFFSET,
    );
    self.update_reference_position(end_position + FOR_IN_STATEMENT_LEFT_OFFSET);
    self.convert_for_head(&for_in_statement.left);
    self.update_reference_position(end_position + FOR_IN_STATEMENT_RIGHT_OFFSET);
    self.convert_expression(&for_in_statement.right);
    self.update_reference_position(end_position + FOR_IN_STATEMENT_BODY_OFFSET);
    self.convert_statement(&for_in_statement.body);
    self.add_end(end_position, &for_in_statement.span);
    self.pop_scope();
    self.on_node_exit(walk_entry);
  }
}
