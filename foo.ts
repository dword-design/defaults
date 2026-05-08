type DeepMerge<TValue, TDefault> = [TValue] extends [Record<string, unknown>]
  ? TValue
  : TDefault

function weakConstraint<T extends { a: number }>() {
  const foo = {} as DeepMerge<T, { b: number }>;
  console.log(foo.a);
}
