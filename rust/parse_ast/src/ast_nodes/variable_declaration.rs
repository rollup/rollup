use swc_common::Span;
use swc_ecma_ast::{UsingDecl, VarDecl, VarDeclKind, VarDeclarator};

use crate::convert_ast::converter::ast_constants::{
  TYPE_VARIABLE_DECLARATION, VARIABLE_DECLARATION_DECLARATIONS_OFFSET,
  VARIABLE_DECLARATION_KIND_OFFSET, VARIABLE_DECLARATION_RESERVED_BYTES,
};
use crate::convert_ast::converter::string_constants::{
  STRING_AWAIT_USING, STRING_CONST, STRING_LET, STRING_USING, STRING_VAR,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_variable_declaration(&mut self, variable_declaration: &VariableDeclaration) {
    let (kind, span, decls): (&[u8; 4], Span, &Vec<VarDeclarator>) = match variable_declaration {
      VariableDeclaration::Var(value) => (
        match value.kind {
          VarDeclKind::Var => &STRING_VAR,
          VarDeclKind::Let => &STRING_LET,
          VarDeclKind::Const => &STRING_CONST,
        },
        value.span,
        &value.decls,
      ),
      &VariableDeclaration::Using(value) => (
        if value.is_await {
          &STRING_AWAIT_USING
        } else {
          &STRING_USING
        },
        value.span,
        &value.decls,
      ),
    };
    let end_position = self.add_type_and_start(
      &TYPE_VARIABLE_DECLARATION,
      &span,
      VARIABLE_DECLARATION_RESERVED_BYTES,
      kind == &STRING_CONST,
    );
    // declarations
    self.convert_item_list(
      decls,
      end_position + VARIABLE_DECLARATION_DECLARATIONS_OFFSET,
      |ast_converter, variable_declarator| {
        ast_converter.store_variable_declarator(variable_declarator);
        true
      },
    );
    // kind
    let kind_position = end_position + VARIABLE_DECLARATION_KIND_OFFSET;
    self.buffer[kind_position..kind_position + 4].copy_from_slice(kind);
    // end
    self.add_end(end_position, &span);
  }
}

pub(crate) enum VariableDeclaration<'a> {
  Var(&'a VarDecl),
  Using(&'a UsingDecl),
}
