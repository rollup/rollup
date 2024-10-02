use swc_common::Span;
use swc_ecma_ast::{
  ComputedPropName, Expr, IdentName, MemberExpr, MemberProp, PrivateName, Super, SuperProp,
  SuperPropExpr,
};

use crate::convert_ast::converter::ast_constants::{
  MEMBER_EXPRESSION_OBJECT_OFFSET, MEMBER_EXPRESSION_PROPERTY_OFFSET,
  MEMBER_EXPRESSION_RESERVED_BYTES, TYPE_MEMBER_EXPRESSION,
};
use crate::convert_ast::converter::AstConverter;
use crate::store_member_expression_flags;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_member_expression(
    &mut self,
    span: &Span,
    is_optional: bool,
    object: &ExpressionOrSuper,
    property: MemberOrSuperProp,
    is_chained: bool,
  ) {
    let end_position = self.add_type_and_start(
      &TYPE_MEMBER_EXPRESSION,
      span,
      MEMBER_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // object
    self.update_reference_position(end_position + MEMBER_EXPRESSION_OBJECT_OFFSET);
    match object {
      ExpressionOrSuper::Expression(Expr::OptChain(optional_chain_expression)) => {
        self.store_chain_expression(optional_chain_expression, is_chained);
      }
      ExpressionOrSuper::Expression(Expr::Call(call_expression)) => {
        self.convert_call_expression(call_expression, false, is_chained);
      }
      ExpressionOrSuper::Expression(Expr::Member(member_expression)) => {
        self.convert_member_expression(member_expression, false, is_chained);
      }
      ExpressionOrSuper::Expression(expression) => {
        self.convert_expression(expression);
      }
      ExpressionOrSuper::Super(super_token) => self.store_super_element(super_token),
    }
    // flags
    store_member_expression_flags!(
      self,
      end_position,
      computed => matches!(property, MemberOrSuperProp::Computed(_)),
      optional => is_optional
    );
    // property
    self.update_reference_position(end_position + MEMBER_EXPRESSION_PROPERTY_OFFSET);
    match property {
      MemberOrSuperProp::Identifier(ident) => self.convert_identifier_name(ident),
      MemberOrSuperProp::Computed(computed) => {
        self.convert_expression(&computed.expr);
      }
      MemberOrSuperProp::PrivateName(private_name) => self.store_private_identifier(private_name),
    }
    // end
    self.add_end(end_position, span);
  }

  pub(crate) fn convert_member_expression(
    &mut self,
    member_expression: &MemberExpr,
    is_optional: bool,
    is_chained: bool,
  ) {
    self.store_member_expression(
      &member_expression.span,
      is_optional,
      &ExpressionOrSuper::Expression(&member_expression.obj),
      match &member_expression.prop {
        MemberProp::Ident(identifier) => MemberOrSuperProp::Identifier(identifier),
        MemberProp::PrivateName(private_name) => MemberOrSuperProp::PrivateName(private_name),
        MemberProp::Computed(computed) => MemberOrSuperProp::Computed(computed),
      },
      is_chained,
    );
  }

  pub(crate) fn convert_super_property(&mut self, super_property: &SuperPropExpr) {
    self.store_member_expression(
      &super_property.span,
      false,
      &ExpressionOrSuper::Super(&super_property.obj),
      match &super_property.prop {
        SuperProp::Ident(identifier) => MemberOrSuperProp::Identifier(identifier),
        SuperProp::Computed(computed_property_name) => {
          MemberOrSuperProp::Computed(computed_property_name)
        }
      },
      false,
    );
  }
}

pub(crate) enum MemberOrSuperProp<'a> {
  Identifier(&'a IdentName),
  PrivateName(&'a PrivateName),
  Computed(&'a ComputedPropName),
}

pub(crate) enum ExpressionOrSuper<'a> {
  Expression(&'a Expr),
  Super(&'a Super),
}
