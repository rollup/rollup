use swc_ecma_ast::ImportNamedSpecifier;

use crate::convert_ast::converter::ast_constants::{
  IMPORT_SPECIFIER_IMPORTED_OFFSET, IMPORT_SPECIFIER_LOCAL_OFFSET, IMPORT_SPECIFIER_RESERVED_BYTES,
  TYPE_IMPORT_SPECIFIER,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_import_specifier(&mut self, import_named_specifier: &ImportNamedSpecifier) {
    let end_position = self.add_type_and_start(
      &TYPE_IMPORT_SPECIFIER,
      &import_named_specifier.span,
      IMPORT_SPECIFIER_RESERVED_BYTES,
      false,
    );
    // imported
    if let Some(imported) = import_named_specifier.imported.as_ref() {
      self.update_reference_position(end_position + IMPORT_SPECIFIER_IMPORTED_OFFSET);
      self.convert_module_export_name(imported);
    }
    // local
    self.update_reference_position(end_position + IMPORT_SPECIFIER_LOCAL_OFFSET);
    self.convert_identifier(&import_named_specifier.local);
    // end
    self.add_end(end_position, &import_named_specifier.span);
  }
}
