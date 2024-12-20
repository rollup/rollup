use swc_ecma_ast::JSXClosingFragment;

use crate::convert_ast::converter::AstConverter;
use crate::store_jsx_closing_fragment;

impl AstConverter<'_> {
  pub(crate) fn store_jsx_closing_fragment(&mut self, jsx_closing_fragment: &JSXClosingFragment) {
    store_jsx_closing_fragment!(
      self,
      span => jsx_closing_fragment.span
    );
  }
}
