use swc_ecma_ast::ImportDecl;

use crate::convert_ast::converter::ast_constants::{
  IMPORT_DECLARATION_ATTRIBUTES_OFFSET, IMPORT_DECLARATION_RESERVED_BYTES,
  IMPORT_DECLARATION_SOURCE_OFFSET, IMPORT_DECLARATION_SPECIFIERS_OFFSET, TYPE_IMPORT_DECLARATION,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_import_declaration(&mut self, import_declaration: &ImportDecl) {
    let end_position = self.add_type_and_start(
      &TYPE_IMPORT_DECLARATION,
      &import_declaration.span,
      IMPORT_DECLARATION_RESERVED_BYTES,
      false,
    );
    // specifiers
    self.convert_item_list(
      &import_declaration.specifiers,
      end_position + IMPORT_DECLARATION_SPECIFIERS_OFFSET,
      |ast_converter, import_specifier| {
        ast_converter.convert_import_specifier(import_specifier);
        true
      },
    );
    // source
    self.update_reference_position(end_position + IMPORT_DECLARATION_SOURCE_OFFSET);
    self.store_literal_string(&import_declaration.src);
    // attributes
    self.store_import_attributes(
      &import_declaration.with,
      end_position + IMPORT_DECLARATION_ATTRIBUTES_OFFSET,
    );
    // end
    self.add_end(end_position, &import_declaration.span);
  }
}
