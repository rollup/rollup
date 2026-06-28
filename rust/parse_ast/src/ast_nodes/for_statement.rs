use swc_ecma_ast::ForStmt;

use crate::convert_ast::converter::ast_constants::{
  FOR_STATEMENT_BODY_OFFSET, FOR_STATEMENT_INIT_OFFSET, FOR_STATEMENT_RESERVED_BYTES,
  FOR_STATEMENT_SCOPE_OFFSET_OFFSET, FOR_STATEMENT_TEST_OFFSET, FOR_STATEMENT_UPDATE_OFFSET,
  NODE_TYPE_ID_FOR_STATEMENT, TYPE_FOR_STATEMENT,
};
use crate::convert_ast::converter::{AstConverter, ScopeType};

impl AstConverter<'_> {
  pub(crate) fn store_for_statement(&mut self, for_statement: &ForStmt) {
    let walk_entry = self.on_node_enter::<NODE_TYPE_ID_FOR_STATEMENT>();
    let end_position = self.add_type_and_start(
      &TYPE_FOR_STATEMENT,
      &for_statement.span,
      FOR_STATEMENT_RESERVED_BYTES,
      false,
    );
    self.push_scope(
      ScopeType::Block,
      end_position + FOR_STATEMENT_SCOPE_OFFSET_OFFSET,
    );
    if let Some(init) = for_statement.init.as_ref() {
      self.update_reference_position(end_position + FOR_STATEMENT_INIT_OFFSET);
      self.convert_variable_declaration_or_expression(init);
    }
    if let Some(test) = for_statement.test.as_ref() {
      self.update_reference_position(end_position + FOR_STATEMENT_TEST_OFFSET);
      self.convert_expression(test);
    }
    if let Some(update) = for_statement.update.as_ref() {
      self.update_reference_position(end_position + FOR_STATEMENT_UPDATE_OFFSET);
      self.convert_expression(update);
    }
    self.update_reference_position(end_position + FOR_STATEMENT_BODY_OFFSET);
    self.convert_statement(&for_statement.body);
    self.add_end(end_position, &for_statement.span);
    self.pop_scope();
    self.on_node_exit(walk_entry);
  }
}
