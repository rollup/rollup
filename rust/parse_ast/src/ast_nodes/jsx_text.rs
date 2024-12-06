use swc_ecma_ast::JSXText;

use crate::convert_ast::converter::AstConverter;
use crate::store_jsx_text;

impl AstConverter<'_> {
  pub(crate) fn store_jsx_text(&mut self, jsx_text: &JSXText) {
    store_jsx_text!(
      self,
      span => jsx_text.span,
      value => &jsx_text.value,
      raw => &jsx_text.raw
    );
  }
}
