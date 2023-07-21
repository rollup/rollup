pub struct Utf8ToUtf16ByteIndexConverter {
  byte_to_utf16: Vec<(u32, u32)>,
}

impl<'a> Utf8ToUtf16ByteIndexConverter {
  pub fn new(code: &'a str) -> Self {
    let mut utf16_index = 0;
    let mut byte_to_utf16 = Vec::with_capacity(code.len());
    byte_to_utf16.push((0, 0));
    for (byte_index, character) in code.char_indices() {
      let length_utf8 = character.len_utf8();
      if length_utf8 > 1 {
        utf16_index += character.len_utf16() as u32;
        byte_to_utf16.push(((byte_index + length_utf8) as u32, utf16_index));
      } else {
        utf16_index += 1;
      }
    }
    byte_to_utf16.shrink_to_fit();
    Self { byte_to_utf16 }
  }

  // TODO Lukas We can avoid searching and storing indices if we can guarantee
  // that indices are queries in a non-descending order. In that case, we can
  // iterate lazily.
  pub fn convert(&self, utf8_index: u32) -> u32 {
    let mut search_index = self.byte_to_utf16.len() - 1;
    while search_index > 0 && self.byte_to_utf16[search_index].0 > utf8_index {
      search_index -= 1;
    }
    self.byte_to_utf16[search_index].1 + (utf8_index - self.byte_to_utf16[search_index].0)
  }
}
