use swc_ecma_ast::JSXClosingElement;

use crate::convert_ast::converter::AstConverter;
use crate::store_jsx_closing_element;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_jsx_closing_element(&mut self, jsx_closing_element: &JSXClosingElement) {
    store_jsx_closing_element!(
      self,
      span => jsx_closing_element.span,
      name => [jsx_closing_element.name, convert_jsx_element_name]
    );
  }
}
