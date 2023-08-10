use std::cell::RefCell;
use swc_common::comments::{Comment, Comments};
use swc_common::BytePos;

#[derive(Default, Debug)]
pub struct SequentialComments {
  annotations: RefCell<Vec<Comment>>,
}

const PURE_COMMENT: &str = "__PURE__";

impl SequentialComments {
  pub fn add_comment(&self, comment: Comment) {
    if let Some(position) = comment.text.find(PURE_COMMENT) {
      if let Some(first_character) = comment.text.bytes().nth(position - 1) {
        if first_character == b'@' || first_character == b'#' {
          // TODO SWC remove this again if we are sure everything is always in order
          let current_position: u32 = self
            .annotations
            .borrow()
            .last()
            .map(|c| c.span.hi.0)
            .unwrap_or(0);
          if current_position > comment.span.lo.0 {
            panic!("Comment {:?} is not in order", comment);
          }
          self.annotations.borrow_mut().push(comment);
        }
      }
    }
  }

  pub fn take_annotations(self) -> Vec<Comment> {
    self.annotations.take()
  }
}

impl Comments for SequentialComments {
  fn add_leading(&self, _: BytePos, comment: Comment) {
    self.add_comment(comment);
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn add_leading_comments(&self, _: BytePos, _: Vec<Comment>) {
    panic!("add_leading_comments");
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn has_leading(&self, _: BytePos) -> bool {
    panic!("has_leading");
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn move_leading(&self, _: BytePos, _: BytePos) {
    panic!("move_leading");
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn take_leading(&self, _: BytePos) -> Option<Vec<Comment>> {
    panic!("take_leading");
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn get_leading(&self, _: BytePos) -> Option<Vec<Comment>> {
    panic!("get_leading");
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn add_trailing(&self, _: BytePos, comment: Comment) {
    self.add_comment(comment);
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn add_trailing_comments(&self, _: BytePos, _: Vec<Comment>) {
    panic!("add_trailing_comments");
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn has_trailing(&self, _: BytePos) -> bool {
    panic!("has_trailing");
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn move_trailing(&self, _: BytePos, _: BytePos) {
    panic!("move_trailing");
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn take_trailing(&self, _: BytePos) -> Option<Vec<Comment>> {
    panic!("take_trailing");
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn get_trailing(&self, _: BytePos) -> Option<Vec<Comment>> {
    panic!("get_trailing");
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn add_pure_comment(&self, _: BytePos) {
    panic!("add_pure_comment");
  }
}
