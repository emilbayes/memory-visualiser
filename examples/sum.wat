(module
  (memory (export "memory") 1)

  (func $sum
    (export "sum")
    (param $input.ptr i32)
    (param $input.end i32)
    (result f64)
    ;; https://en.wikipedia.org/wiki/Kahan_summation_algorithm#Further_enhancements

    (local $sum f64)
    (local $correction f64)
    (local $temp f64)
    (local $input.i f64)

    (set_local $sum (f64.load (get_local $input.ptr)))
    (set_local $input.ptr (i32.add (get_local $input.ptr) (i32.const 8)))
    (if (i32.eq (get_local $input.ptr) (get_local $input.end))
      (then (return (get_local $sum))))

    (loop $continue
      (set_local $temp (f64.add (get_local $sum) (tee_local $input.i (f64.load (get_local $input.ptr)))))

      (if (f64.ge (f64.abs (get_local $sum)) (f64.abs (get_local $input.i)))
        (then (set_local $correction (f64.add (get_local $correction) (f64.add (get_local $input.i) (f64.sub (get_local $sum) (get_local $temp))))))
        (else (set_local $correction (f64.add (get_local $correction) (f64.add (get_local $sum) (f64.sub (get_local $input.i) (get_local $temp))))))
      )

      (set_local $sum (get_local $temp))


      (br_if $continue
             (i32.lt_u (tee_local $input.ptr (i32.add (get_local $input.ptr) (i32.const 8)))
                       (get_local $input.end)))
    )

    (return (f64.add (get_local $sum) (get_local $correction)))
  )
)
