use swc_ecma_ast::{BindingIdent, Ident, IdentName};

use crate::convert_ast::converter::ast_constants::{
  IDENTIFIER_NAME_OFFSET, IDENTIFIER_RESERVED_BYTES, NODE_TYPE_ID_IDENTIFIER, TYPE_IDENTIFIER,
};
use crate::convert_ast::converter::AstConverter;

impl AstConverter<'_> {
  pub(crate) fn store_identifier(&mut self, start: u32, end: u32, name: &str) {
    let walk_entry = self.on_node_enter::<NODE_TYPE_ID_IDENTIFIER>();
    let end_position =
      self.add_type_and_explicit_start(&TYPE_IDENTIFIER, start, IDENTIFIER_RESERVED_BYTES);
    // name
    self.convert_string(name, end_position + IDENTIFIER_NAME_OFFSET);
    // end
    self.add_explicit_end(end_position, end);
    self.on_node_exit(walk_entry);
  }

  pub(crate) fn convert_binding_identifier(&mut self, binding_identifier: &BindingIdent) {
    self.convert_identifier(&binding_identifier.id);
  }

  pub(crate) fn convert_identifier(&mut self, identifier: &Ident) {
    self.store_identifier(
      identifier.span.lo.0 - 1,
      identifier.span.hi.0 - 1,
      &identifier.sym,
    );
  }
  pub(crate) fn convert_identifier_name(&mut self, identifier: &IdentName) {
    self.store_identifier(
      identifier.span.lo.0 - 1,
      identifier.span.hi.0 - 1,
      &identifier.sym,
    );
  }
}
