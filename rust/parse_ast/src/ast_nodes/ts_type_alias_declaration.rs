use swc_ecma_ast::TsTypeAliasDecl;

use crate::convert_ast::converter::ast_constants::{
    TS_TYPE_ALIAS_DECLARATION_ID_OFFSET, TS_TYPE_ALIAS_DECLARATION_RESERVED_BYTES,
    TS_TYPE_ALIAS_DECLARATION_TYPE_ANNOTATION_OFFSET, TYPE_TS_TYPE_ALIAS_DECLARATION,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_ts_type_alias_declaration(
    &mut self,
    ts_type_alias_declaration: &TsTypeAliasDecl,
  ) {
    let end_position = self.add_type_and_start(
      &TYPE_TS_TYPE_ALIAS_DECLARATION,
      &ts_type_alias_declaration.span,
      TS_TYPE_ALIAS_DECLARATION_RESERVED_BYTES,
      false,
    );
    // name
    self.update_reference_position(end_position + TS_TYPE_ALIAS_DECLARATION_ID_OFFSET);
    self.convert_identifier(&ts_type_alias_declaration.id);

    // type annotation
    self.update_reference_position(end_position + TS_TYPE_ALIAS_DECLARATION_TYPE_ANNOTATION_OFFSET);
    self.convert_ts_type(&ts_type_alias_declaration.type_ann);

    // end
    self.add_end(end_position, &ts_type_alias_declaration.span);
  }
}
