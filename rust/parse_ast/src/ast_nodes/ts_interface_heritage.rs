use crate::convert_ast::converter::ast_constants::{
  TS_INTERFACE_DECLARATION_RESERVED_BYTES, TS_INTERFACE_HERITAGE_EXPRESSION_OFFSET,
  TS_INTERFACE_HERITAGE_RESERVED_BYTES, TYPE_TS_INTERFACE_DECLARATION, TYPE_TS_INTERFACE_HERITAGE,
};
use crate::convert_ast::converter::AstConverter;
use swc_ecma_ast::{TsExprWithTypeArgs, TsInterfaceDecl};

impl<'a> AstConverter<'a> {
  pub fn store_ts_interface_heritage(&mut self, heritage: &TsExprWithTypeArgs) {
    let end_position = self.add_type_and_start(
      &TYPE_TS_INTERFACE_HERITAGE,
      &heritage.span,
      TS_INTERFACE_HERITAGE_RESERVED_BYTES,
      false,
    );

    // expression
    self.update_reference_position(end_position + TS_INTERFACE_HERITAGE_EXPRESSION_OFFSET);
    self.convert_expression(&heritage.expr);

    // end
    self.add_end(end_position, &heritage.span);
  }
}
