(module
  (memory (export "memory") 1)
  (func (export "reverse")
    ;; void (i32 input.ptr, i32 input.length)
    (param $input.ptr i32)
    (param $input.length i32)

    (local $left.ptr i32)
    (local $right.ptr i32)

    (local $a i32)
    (local $b i32)

    (set_local $left.ptr (get_local $input.ptr))
    (set_local $right.ptr (i32.sub (get_local $input.length) (i32.const 1)))

    (loop $continue
      (set_local $a (i32.load8_u (get_local $left.ptr)))
      (set_local $b (i32.load8_u (get_local $right.ptr)))

      (i32.store8 (get_local $right.ptr) (get_local $a))
      (i32.store8 (get_local $left.ptr) (get_local $b))

      (set_local $left.ptr (i32.add (get_local $left.ptr)
                                     (i32.const 1)))
      (set_local $right.ptr (i32.sub (get_local $right.ptr)
                                     (i32.const 1)))

      (br_if $continue
             (i32.lt_u (get_local $left.ptr)
                       (get_local $right.ptr)))
    )
  )
)
