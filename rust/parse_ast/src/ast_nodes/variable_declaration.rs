use swc_common::Span;
use swc_ecma_ast::{UsingDecl, VarDecl, VarDeclarator, VarDeclKind};

use crate::convert_ast::converter::ast_constants::{
  TYPE_VARIABLE_DECLARATION, VARIABLE_DECLARATION_DECLARATIONS_OFFSET,
  VARIABLE_DECLARATION_DECLARE_FLAG, VARIABLE_DECLARATION_FLAGS_OFFSET,
  VARIABLE_DECLARATION_KIND_OFFSET, VARIABLE_DECLARATION_RESERVED_BYTES,
};
use crate::convert_ast::converter::AstConverter;
use crate::convert_ast::converter::string_constants::{
  STRING_AWAIT_USING, STRING_CONST, STRING_LET, STRING_USING, STRING_VAR,
};

impl<'a> AstConverter<'a> {
  pub fn store_variable_declaration(&mut self, variable_declaration: &VariableDeclaration) {
    let (kind, span, decls, declare): (&[u8; 4], Span, &Vec<VarDeclarator>, bool) =
      match variable_declaration {
        VariableDeclaration::Var(value) => (
          match value.kind {
            VarDeclKind::Var => &STRING_VAR,
            VarDeclKind::Let => &STRING_LET,
            VarDeclKind::Const => &STRING_CONST,
          },
          value.span,
          &value.decls,
          value.declare,
        ),
        &VariableDeclaration::Using(value) => (
          if value.is_await {
            &STRING_AWAIT_USING
          } else {
            &STRING_USING
          },
          value.span,
          &value.decls,
          false,
        ),
      };
    let end_position = self.add_type_and_start(
      &TYPE_VARIABLE_DECLARATION,
      &span,
      VARIABLE_DECLARATION_RESERVED_BYTES,
      kind == &STRING_CONST,
    );
    // flags
    let mut flags = 0u32;
    if declare {
      flags |= VARIABLE_DECLARATION_DECLARE_FLAG;
    }
    let flags_position = end_position + VARIABLE_DECLARATION_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
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

pub enum VariableDeclaration<'a> {
  Var(&'a VarDecl),
  Using(&'a UsingDecl),
}
