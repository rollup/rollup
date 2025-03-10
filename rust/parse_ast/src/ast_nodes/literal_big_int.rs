use swc_ecma_ast::BigInt;

use crate::convert_ast::converter::AstConverter;
use crate::store_literal_big_int;

impl AstConverter<'_> {
  pub(crate) fn store_literal_bigint(&mut self, bigint: &BigInt) {
    store_literal_big_int!(
      self,
      span => &bigint.span,
      bigint => &bigint.value.to_str_radix(10),
      raw => bigint.raw.as_ref().unwrap()
    );
  }
}
