use swc_ecma_ast::JSXFragment;

use crate::convert_ast::converter::ast_constants::{
    JSX_FRAGMENT_CHILDREN_OFFSET, JSX_FRAGMENT_CLOSING_FRAGMENT_OFFSET,
    JSX_FRAGMENT_OPENING_FRAGMENT_OFFSET, JSX_FRAGMENT_RESERVED_BYTES, TYPE_JSX_FRAGMENT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_jsx_fragment(&mut self, jsx_fragment: &JSXFragment) {
    let end_position = self.add_type_and_start(
      &TYPE_JSX_FRAGMENT,
      &jsx_fragment.span,
      JSX_FRAGMENT_RESERVED_BYTES,
      false,
    );
    // openingFragment
    self.update_reference_position(end_position + JSX_FRAGMENT_OPENING_FRAGMENT_OFFSET);
    self.store_jsx_opening_fragment(jsx_fragment.opening);
    // children
    self.convert_item_list(
      &jsx_fragment.children,
      end_position + JSX_FRAGMENT_CHILDREN_OFFSET,
      |ast_converter, jsx_element_child| {
        ast_converter.convert_jsx_element_child(jsx_element_child);
        true
      },
    );
    // closingFragment
    self.update_reference_position(end_position + JSX_FRAGMENT_CLOSING_FRAGMENT_OFFSET);
    self.store_jsx_closing_fragment(&jsx_fragment.closing);
    // end
    self.add_end(end_position, &jsx_fragment.span);
  }
}
