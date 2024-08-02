use swc_ecma_ast::JSXSpreadChild;

use crate::convert_ast::converter::ast_constants::{
  JSX_SPREAD_CHILD_EXPRESSION_OFFSET, JSX_SPREAD_CHILD_RESERVED_BYTES, TYPE_JSX_SPREAD_CHILD,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_jsx_spread_child(&mut self, jsx_spread_child: &JSXSpreadChild) {
    let end_position = self.add_type_and_start(
      &TYPE_JSX_SPREAD_CHILD,
      &jsx_spread_child.span,
      JSX_SPREAD_CHILD_RESERVED_BYTES,
      false,
    );
    // expression
    self.update_reference_position(end_position + JSX_SPREAD_CHILD_EXPRESSION_OFFSET);
    self.convert_expression(&jsx_spread_child.expr);
    // end
    self.add_end(end_position, &jsx_spread_child.span);
  }
}
