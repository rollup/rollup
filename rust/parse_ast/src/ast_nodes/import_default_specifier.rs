use swc_ecma_ast::ImportDefaultSpecifier;

use crate::convert_ast::converter::ast_constants::{
  IMPORT_DEFAULT_SPECIFIER_LOCAL_OFFSET, IMPORT_DEFAULT_SPECIFIER_RESERVED_BYTES,
  TYPE_IMPORT_DEFAULT_SPECIFIER,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_import_default_specifier(
    &mut self,
    import_default_specifier: &ImportDefaultSpecifier,
  ) {
    let end_position = self.add_type_and_start(
      &TYPE_IMPORT_DEFAULT_SPECIFIER,
      &import_default_specifier.span,
      IMPORT_DEFAULT_SPECIFIER_RESERVED_BYTES,
      false,
    );
    // local
    self.update_reference_position(end_position + IMPORT_DEFAULT_SPECIFIER_LOCAL_OFFSET);
    self.convert_identifier(&import_default_specifier.local);
    // end
    self.add_end(end_position, &import_default_specifier.span);
  }
}
