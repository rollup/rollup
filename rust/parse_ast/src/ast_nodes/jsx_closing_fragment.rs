use swc_ecma_ast::JSXClosingFragment;

use crate::convert_ast::converter::ast_constants::{
    JSX_CLOSING_FRAGMENT_RESERVED_BYTES, TYPE_JSX_CLOSING_FRAGMENT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_jsx_closing_fragment(&mut self, jsx_closing_fragment: &JSXClosingFragment) {
    let end_position = self.add_type_and_start(
      &TYPE_JSX_CLOSING_FRAGMENT,
      &jsx_closing_fragment.span,
      JSX_CLOSING_FRAGMENT_RESERVED_BYTES,
      false,
    );
    // end
    self.add_end(end_position, &jsx_closing_fragment.span);
  }
}
