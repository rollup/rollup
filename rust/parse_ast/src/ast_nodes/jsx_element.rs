use swc_ecma_ast::JSXElement;

use crate::convert_ast::converter::AstConverter;
use crate::store_jsx_element;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_jsx_element(&mut self, jsx_element: &JSXElement) {
    store_jsx_element!(
      self,
      span => jsx_element.span,
      openingElement => [jsx_element.opening, store_jsx_opening_element],
      children => [jsx_element.children, convert_jsx_element_child],
      closingElement => [jsx_element.closing, store_jsx_closing_element]
    );
  }
}
