(module
  (memory (export "memory") 1)

  (;
    All WASM adressing is 32 bit, so all *.store and *.load are [i32, *]


    Issues:

      * Only one instance at a time
      * No checks for out-of-bound reading right now
      * No paging (allocating index 999999999, requires all preceding bits to exist)
  ;)

  (func $get
    (export "get")
    (param $idx i32)
    (result i32)

    (local $offset i32) ;; i32 due to adressing
    ;; Find the next QWORD boundary
    (set_local $offset (i32.mul (i32.const 8) ;; qword size in bytes
                                (i32.div_u (get_local $idx)
                                           (i32.const 64)))) ;; qword size in bits

    (i32.xor (i32.const 1) ;; 1 XOR x === NOT x
             (i64.eqz (i64.and (i64.load (get_local $offset))
                               (i64.shl (i64.const 1) ;; Shift bit to index position
                                        (i64.extend_u/i32 (i32.rem_u (get_local $idx) ;; Index position in qword
                                                                     (i32.const 64)))))))
  )

  (func $set
    (export "set")
    (param $idx i32)
    (param $val i32)

    (if (i32.eqz (get_local $val))
      (then (call $low (get_local $idx)))
      (else (call $high (get_local $idx)))
    )
  )

  (func $high
    (export "high")
    (param $idx i32)

    (local $offset i32)
    (set_local $offset (i32.mul (i32.const 8) ;; word size
                                (i32.div_u (get_local $idx)
                                           (i32.const 64))))

    (i64.store (get_local $offset)
               (i64.or (i64.load (get_local $offset))
                        (i64.shl (i64.const 1)
                                 (i64.extend_u/i32 (i32.rem_u (get_local $idx)
                                                              (i32.const 64))))))
  )

  (func $low
    (export "low")
    (param $idx i32)

    (local $offset i32)
    (set_local $offset (i32.mul (i32.const 8) ;; word size
                                (i32.div_u (get_local $idx)
                                           (i32.const 64))))

    (i64.store (get_local $offset)
               (i64.and (i64.load (get_local $offset))
                        (i64.xor (i64.const 0xffffffffffffffff)
                                 (i64.shl (i64.const 1)
                                          (i64.extend_u/i32 (i32.rem_u (get_local $idx)
                                                                       (i32.const 64)))))))
  )
)
