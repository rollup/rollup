use swc_common::Span;
use swc_ecma_ast::{Decl, ExportDecl, ExportSpecifier, ObjectLit, Str, VarDeclKind};

use crate::convert_ast::converter::ast_constants::{
  EXPORT_NAMED_DECLARATION_ATTRIBUTES_OFFSET, EXPORT_NAMED_DECLARATION_DECLARATION_OFFSET,
  EXPORT_NAMED_DECLARATION_RESERVED_BYTES, EXPORT_NAMED_DECLARATION_SOURCE_OFFSET,
  EXPORT_NAMED_DECLARATION_SPECIFIERS_OFFSET, TYPE_EXPORT_NAMED_DECLARATION,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_export_named_declaration(
    &mut self,
    span: &Span,
    specifiers: &[ExportSpecifier],
    src: Option<&Str>,
    declaration: Option<&Decl>,
    with: &Option<Box<ObjectLit>>,
  ) {
    let end_position = self.add_type_and_start(
      &TYPE_EXPORT_NAMED_DECLARATION,
      span,
      EXPORT_NAMED_DECLARATION_RESERVED_BYTES,
      match declaration {
        Some(Decl::Fn(_)) => true,
        Some(Decl::Var(variable_declaration)) => variable_declaration.kind == VarDeclKind::Const,
        _ => false,
      },
    );
    // specifiers
    self.convert_item_list(
      specifiers,
      end_position + EXPORT_NAMED_DECLARATION_SPECIFIERS_OFFSET,
      |ast_converter, specifier| {
        ast_converter.convert_export_specifier(specifier);
        true
      },
    );
    // declaration
    if let Some(declaration) = declaration {
      self.update_reference_position(end_position + EXPORT_NAMED_DECLARATION_DECLARATION_OFFSET);
      self.convert_declaration(declaration);
    }
    // source
    if let Some(src) = src {
      self.update_reference_position(end_position + EXPORT_NAMED_DECLARATION_SOURCE_OFFSET);
      self.store_literal_string(src);
    }
    // attributes
    self.store_import_attributes(
      with,
      end_position + EXPORT_NAMED_DECLARATION_ATTRIBUTES_OFFSET,
    );
    // end
    self.add_end(end_position, span);
  }

  pub(crate) fn convert_export_declaration(&mut self, export_declaration: &ExportDecl) {
    self.store_export_named_declaration(
      &export_declaration.span,
      &[],
      None,
      Some(&export_declaration.decl),
      &None,
    );
  }
}
