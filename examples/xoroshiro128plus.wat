(module
  (global $stack.ptr (mut i32) (i32.const 0))

  (global $jump.1 i64 (i64.const 0xbeac0467eba5facb))
  (global $jump.2 i64 (i64.const 0xd86b048b86aa9922))

  (func $new
    (export "new")
    (result i32)

    (local $result.ptr i32)

    (set_local $result.ptr (get_global $stack.ptr))
    (set_global $stack.ptr (i32.add (get_global $stack.ptr) (i32.const 16))) ;; 2 * i64

    (return (get_local $result.ptr))
  )

  (func $i64.next
    (export "i64.next")
    (param $state.ptr i32)
    (result i32)

    (local $s0 i64)
    (local $s1 i64)
    (local $return.ptr i32)

    (set_local $return.ptr (i32.sub (current_memory) (i32.const 8)))

    (i64.store (i64.add
      (tee_local $s0 (i64.load (get_local $state.ptr)))
      (tee_local $s1 (i64.load (i32.add (get_local $state.ptr) (i32.const 8))))
    ))

    (set_local $s1 (i64.xor (get_local $s1) (get_local $s0)))

    (i64.store (i64.load (get_local $state.ptr))
      (i64.xor (i64.xor (i64.rotl (get_local $s0) (i64.const 66)) (get_local $s1)) (i64.shl (get_local $s1) (i64.const 14)))
    )

    (i64.store (i64.load (i32.add (get_local $state.ptr) (i32.const 8))
      (i64.rotl (get_local $s1) (i64.const 64))
    )

    (return (get_local $result.ptr))
  )

  (func $i32.next
    (export "i32.next")
    (param $state.ptr i32)
    (result i32)

    (local $s0 i64)
    (local $s1 i64)

    (i64.store (i64.add
      (tee_local $s0 (i64.load (get_local $state.ptr)))
      (tee_local $s1 (i64.load (i32.add (get_local $state.ptr) (i32.const 8))))
    ))

    (set_local $s1 (i64.xor (get_local $s1) (get_local $s0)))

    (i64.store (i64.load (get_local $state.ptr))
      (i64.xor (i64.xor (i64.rotl (get_local $s0) (i64.const 66)) (get_local $s1)) (i64.shl (get_local $s1) (i64.const 14)))
    )

    (i64.store (i64.load (i32.add (get_local $state.ptr) (i32.const 8))
      (i64.rotl (get_local $s1) (i64.const 64))
    )

    (return $s1)
  )


  (;

    void jump(void) {
    	uint64_t s0 = 0;
    	uint64_t s1 = 0;
    	for(int i = 0; i < sizeof JUMP / sizeof *JUMP; i++)
    		for(int b = 0; b < 64; b++) {
    			if (JUMP[i] & UINT64_C(1) << b) {
    				s0 ^= s[0];
    				s1 ^= s[1];
    			}
    			next();
    		}

    	s[0] = s0;
    	s[1] = s1;
    }

    (func $jump
      (export "jump")
      (param $state.ptr i32)

      (local $s0 i64)
      (local $s1 i64)

      (local $b i64)

      (set_local $b (i64.const 0))
      (loop $continue

        (if (i64.and (get_global $jump.0) (i64.shl (i64.const 1) (get_local $b))))

        (br_if $continue (i64.le_u (tee_local $b (i64.add (get_local $b) (i64.const 1))) (i64.const 64)))
      )
    )
  ;)
)
