import isPlainObj from 'is-plain-obj';
import { union } from 'lodash-es';
import type { SimplifyDeep } from 'type-fest';

type UndefinedToObject<T extends Record<string, unknown> | undefined> =
  Exclude<T, undefined> extends infer O extends Record<string, unknown>
    ? {
        -readonly [K in keyof O]:
          | O[K]
          | (undefined extends T ? undefined : never);
      }
    : never;

type MergeObjects<
  TValue extends Record<string, unknown> | undefined,
  TDefault extends Record<string, unknown>,
> = {
  -readonly [K in
    | keyof UndefinedToObject<TValue>
    | keyof TDefault]: K extends keyof UndefinedToObject<TValue>
    ? K extends keyof TDefault
      ? DeepMerge<UndefinedToObject<TValue>[K], TDefault[K]>
      : UndefinedToObject<TValue>[K]
    : K extends keyof TDefault
      ? TDefault[K]
      : never;
};

type DeepMerge<TValue, TDefault> = [TValue] extends [null]
  ? null
  : /* eslint-disable @typescript-eslint/no-unsafe-function-type */
    [TValue] extends [Function]
    ? /* eslint-enable @typescript-eslint/no-unsafe-function-type */
      TValue
    : [TValue] extends [readonly unknown[]]
      ? [TDefault] extends [readonly unknown[]]
        ? [...TDefault, ...TValue]
        : TValue
      : [TValue, TDefault] extends [
            Record<string, unknown> | undefined,
            Record<string, unknown>,
          ] // TODO: https://github.com/microsoft/TypeScript/issues/29063
        ? MergeObjects<
            Extract<TValue, Record<string, unknown> | undefined>,
            Extract<TDefault, Record<string, unknown>>
          >
        : [undefined] extends [TValue]
          ? Exclude<TValue, undefined> | TDefault
          : TValue;

type DeepMergeMultiple<T extends unknown[]> = T extends [
  infer T1,
  ...infer TRest,
]
  ? TRest extends unknown[]
    ? DeepMerge<T1, DeepMergeMultiple<TRest>>
    : T1
  : unknown;

const mergeTwo = <TValue, TDefault>(
  value: TValue,
  defaultValue: TDefault,
): DeepMerge<TValue, TDefault> => {
  if (value === undefined) {
    return defaultValue as DeepMerge<TValue, TDefault>;
  }

  if (Array.isArray(value) && Array.isArray(defaultValue)) {
    return [...defaultValue, ...value] as DeepMerge<TValue, TDefault>;
  }

  if (isPlainObj(value) && isPlainObj(defaultValue)) {
    return Object.fromEntries(
      union(Object.keys(value), Object.keys(defaultValue)).map(key => [
        key,
        mergeTwo(value[key], defaultValue[key]),
      ]),
    ) as DeepMerge<TValue, TDefault>;
  }

  return value as DeepMerge<TValue, TDefault>;
};

type Defaults = {
  <
    TValue extends object,
    TDefault extends object,
    TValueKey extends keyof TValue = keyof TValue,
    TDefaultKey extends keyof TDefault = keyof TDefault,
  >(
    value: TValue & { [K in TValueKey]: number },
    defaultValue: Extract<TValueKey, TDefaultKey> extends never
      ? TDefault
      : never,
  ): DeepMerge<TValue, TDefault> & Record<TValueKey, number>;
  <T extends unknown[]>(...args: T): SimplifyDeep<DeepMergeMultiple<T>>;
};

const defaults = ((...args: unknown[]) => {
  let result: unknown;

  for (const current of args.reverse()) {
    result = mergeTwo(current, result);
  }

  return result;
}) as Defaults;

export default defaults;
