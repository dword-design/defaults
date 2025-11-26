import { expect, test } from '@playwright/test';
import { expectTypeOf } from 'expect-type';

import self from '.';

test.describe('value', () => {
  test('value', () => {
    const result = self(2 as const, 1 as const);
    expect(result).toEqual(2);
    expectTypeOf(result).toEqualTypeOf<2>();
  });

  test('undefined', () => {
    const result = self(undefined, 1 as const);
    expect(result).toEqual(1);
    expectTypeOf(result).toEqualTypeOf<1>();
  });

  test('null', () => {
    const result = self(null, 1);
    expect(result).toEqual(null);
    expectTypeOf(result).toEqualTypeOf<null>();
  });

  test('relaxed type', () => {
    const result = self(2, 1);
    expect(result).toEqual(2);
    expectTypeOf(result).toEqualTypeOf<number>();
  });
});

test.describe('object', () => {
  test('value', () => {
    const result = self({ a: 2 as const }, { a: 1 as const });
    expect(result).toEqual({ a: 2 });
    expectTypeOf(result).toEqualTypeOf<{ a: 2 }>();
  });

  test('undefined', () => {
    const result = self({ a: undefined }, { a: 1 as const });
    expect(result).toEqual({ a: 1 });
    expectTypeOf(result).toEqualTypeOf<{ a: 1 }>();
  });

  test('null', () => {
    const result = self({ a: null }, { a: 1 as const });
    expect(result).toEqual({ a: null });
    expectTypeOf(result).toEqualTypeOf<{ a: null }>();
  });

  test('nested', () => {
    const result = self({ a: { b: 2 as const } }, { a: { b: 1 as const } });
    expect(result).toEqual({ a: { b: 2 } });
    expectTypeOf(result).toEqualTypeOf<{ a: { b: 2 } }>();
  });

  test('tuples', () => {
    const result = self({ a: [2] as const }, { a: [1] as const });
    expect(result).toEqual({ a: [1, 2] });
    expectTypeOf(result.a).toMatchTypeOf<[1, 2]>();
  });

  test('arrays', () => {
    const result = self({ a: [2] }, { a: [1] });
    expect(result).toEqual({ a: [1, 2] });
    expectTypeOf(result.a).toMatchTypeOf<number[]>();
  });

  test('arrays mixed types', () => {
    const result = self({ a: ['foo'] }, { a: [1] });
    expect(result).toEqual({ a: [1, 2] });
    expectTypeOf(result.a).toMatchTypeOf<Array<number | string>>();
  });

  test('mixed properties', () => {
    const result = self(
      { a: 1 as const, b: 2 as const },
      { b: 3 as const, c: 4 as const },
    );

    expect(result).toEqual({ a: 1, b: 2, c: 4 });
    expectTypeOf(result).toEqualTypeOf<{ a: 1; b: 2; c: 4 }>();
  });
});
