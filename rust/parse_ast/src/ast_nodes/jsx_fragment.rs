use swc_ecma_ast::JSXFragment;

use crate::convert_ast::converter::AstConverter;
use crate::store_jsx_fragment;

impl AstConverter<'_> {
  pub(crate) fn store_jsx_fragment(&mut self, jsx_fragment: &JSXFragment) {
    store_jsx_fragment!(
      self,
      span => jsx_fragment.span,
      openingFragment => [jsx_fragment.opening, store_jsx_opening_fragment],
      children => [jsx_fragment.children, convert_jsx_element_child],
      closingFragment => [jsx_fragment.closing, store_jsx_closing_fragment]
    );
  }
}
