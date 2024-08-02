use swc_ecma_ast::JSXOpeningFragment;

use crate::convert_ast::converter::ast_constants::{
    JSX_OPENING_FRAGMENT_RESERVED_BYTES, TYPE_JSX_OPENING_FRAGMENT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_jsx_opening_fragment(&mut self, jsxopening_fragment: JSXOpeningFragment) {
    let end_position = self.add_type_and_start(
      &TYPE_JSX_OPENING_FRAGMENT,
      &jsxopening_fragment.span,
      JSX_OPENING_FRAGMENT_RESERVED_BYTES,
      false,
    );
    // end
    self.add_end(end_position, &jsxopening_fragment.span);
  }
}
