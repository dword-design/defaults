type DeepMerge<TValue, TDefault> = [TValue] extends [{ a: number }]
  ? TValue
  : TDefault;

function weakConstraint<T extends { a: number }>() {
  const foo = {} as DeepMerge<T, { b: number }>
  console.log(foo.a);
  return foo;
}

const blub = weakConstraint<{ a: number }>();

function f<T extends number>(x: T) {
    var y: T extends number ? number : string;

    // `T` is not assignable to `T extends number ? number : string`
    y = x;
 }