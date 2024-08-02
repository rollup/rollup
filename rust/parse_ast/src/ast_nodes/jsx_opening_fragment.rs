use swc_ecma_ast::JSXOpeningFragment;

use crate::convert_ast::converter::AstConverter;
use crate::store_jsx_opening_fragment;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_jsx_opening_fragment(&mut self, jsx_opening_fragment: &JSXOpeningFragment) {
    store_jsx_opening_fragment!(
      self,
      span => jsx_opening_fragment.span
    );
  }
}
