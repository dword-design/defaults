import isPlainObj from 'is-plain-obj';
import { union } from 'lodash-es';

type DeepMerge<TValue, TDefault> = TValue extends null
  ? null
  : TValue extends readonly unknown[]
    ? TDefault extends readonly unknown[]
      ? [...TDefault, ...TValue]
      : TValue
    : TValue extends object // TODO: https://github.com/microsoft/TypeScript/issues/29063
      ? TDefault extends object
        ? TValue extends TDefault
          ? TValue
          : Omit<TValue, keyof TValue & keyof TDefault> &
              Omit<TDefault, keyof TValue & keyof TDefault> & {
                -readonly [Key in keyof TValue & keyof TDefault]: DeepMerge<
                  TValue[Key],
                  TDefault[Key]
                >;
              }
        : TValue
      : TValue extends undefined
        ? TDefault
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

export default <T extends unknown[]>(...args: T): DeepMergeMultiple<T> => {
  let result: unknown = undefined;

  for (const current of args.reverse()) {
    result = mergeTwo(current, result);
  }

  return result as DeepMergeMultiple<T>;
};
