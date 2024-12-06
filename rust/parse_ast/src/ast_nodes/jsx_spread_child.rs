use swc_ecma_ast::JSXSpreadChild;

use crate::convert_ast::converter::AstConverter;
use crate::store_jsx_spread_child;

impl AstConverter<'_> {
  pub(crate) fn store_jsx_spread_child(&mut self, jsx_spread_child: &JSXSpreadChild) {
    store_jsx_spread_child!(
      self,
      span => jsx_spread_child.span,
      expression => [jsx_spread_child.expr, convert_expression]
    );
  }
}
