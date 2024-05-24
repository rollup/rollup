use crate::convert_ast::converter::ast_constants::{
  TS_INTERFACE_BODY_BODY_OFFSET, TS_INTERFACE_BODY_RESERVED_BYTES, TYPE_TS_INTERFACE_BODY,
};
use crate::convert_ast::converter::AstConverter;
use swc_ecma_ast::TsInterfaceBody;

impl<'a> AstConverter<'a> {
  pub fn store_ts_interface_body(&mut self, interface_body: &TsInterfaceBody) {
    let end_position = self.add_type_and_start(
      &TYPE_TS_INTERFACE_BODY,
      &interface_body.span,
      TS_INTERFACE_BODY_RESERVED_BYTES,
      false,
    );

    // body
    self.convert_item_list(
      &interface_body.body,
      end_position + TS_INTERFACE_BODY_BODY_OFFSET,
      |_ast, _node| true,
    );

    // end
    self.add_end(end_position, &interface_body.span);
  }
}
