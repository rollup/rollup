use swc_ecma_ast::JSXAttr;

use crate::convert_ast::converter::AstConverter;
use crate::store_jsx_attribute;

impl AstConverter<'_> {
  pub(crate) fn store_jsx_attribute(&mut self, jsx_attribute: &JSXAttr) {
    store_jsx_attribute!(
      self,
      span => jsx_attribute.span,
      name => [jsx_attribute.name, convert_jsx_attribute_name],
      value => [jsx_attribute.value, convert_jsx_attribute_value]
    );
  }
}
