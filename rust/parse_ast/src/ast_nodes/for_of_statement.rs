use swc_ecma_ast::ForOfStmt;

use crate::convert_ast::converter::ast_constants::{
  FOR_OF_STATEMENT_BODY_OFFSET, FOR_OF_STATEMENT_LEFT_OFFSET, FOR_OF_STATEMENT_RESERVED_BYTES,
  FOR_OF_STATEMENT_RIGHT_OFFSET, FOR_OF_STATEMENT_SCOPE_OFFSET_OFFSET,
  NODE_TYPE_ID_FOR_OF_STATEMENT, TYPE_FOR_OF_STATEMENT,
};
use crate::convert_ast::converter::{AstConverter, ScopeType};
use crate::store_for_of_statement_flags;

impl AstConverter<'_> {
  pub(crate) fn store_for_of_statement(&mut self, for_of_statement: &ForOfStmt) {
    let walk_entry = self.on_node_enter::<NODE_TYPE_ID_FOR_OF_STATEMENT>();
    let end_position = self.add_type_and_start(
      &TYPE_FOR_OF_STATEMENT,
      &for_of_statement.span,
      FOR_OF_STATEMENT_RESERVED_BYTES,
      false,
    );
    self.push_scope(
      ScopeType::Block,
      end_position + FOR_OF_STATEMENT_SCOPE_OFFSET_OFFSET,
    );
    store_for_of_statement_flags!(self, end_position, await => for_of_statement.is_await);
    self.update_reference_position(end_position + FOR_OF_STATEMENT_LEFT_OFFSET);
    self.convert_for_head(&for_of_statement.left);
    self.update_reference_position(end_position + FOR_OF_STATEMENT_RIGHT_OFFSET);
    self.convert_expression(&for_of_statement.right);
    self.update_reference_position(end_position + FOR_OF_STATEMENT_BODY_OFFSET);
    self.convert_statement(&for_of_statement.body);
    self.add_end(end_position, &for_of_statement.span);
    self.pop_scope();
    self.on_node_exit(walk_entry);
  }
}
