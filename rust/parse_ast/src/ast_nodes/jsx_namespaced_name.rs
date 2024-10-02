use swc_ecma_ast::JSXNamespacedName;

use crate::convert_ast::converter::ast_constants::{
  JSX_NAMESPACED_NAME_NAMESPACE_OFFSET, JSX_NAMESPACED_NAME_NAME_OFFSET,
  JSX_NAMESPACED_NAME_RESERVED_BYTES, TYPE_JSX_NAMESPACED_NAME,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_jsx_namespaced_name(&mut self, jsx_namespaced_name: &JSXNamespacedName) {
    let end_position = self.add_type_and_start(
      &TYPE_JSX_NAMESPACED_NAME,
      &jsx_namespaced_name.ns.span,
      JSX_NAMESPACED_NAME_RESERVED_BYTES,
      false,
    );
    // namespace
    self.update_reference_position(end_position + JSX_NAMESPACED_NAME_NAMESPACE_OFFSET);
    self.store_jsx_identifier(&jsx_namespaced_name.ns.span, &jsx_namespaced_name.ns.sym);
    // name
    self.update_reference_position(end_position + JSX_NAMESPACED_NAME_NAME_OFFSET);
    self.store_jsx_identifier(
      &jsx_namespaced_name.name.span,
      &jsx_namespaced_name.name.sym,
    );
    // end
    self.add_end(end_position, &jsx_namespaced_name.name.span);
  }
}
