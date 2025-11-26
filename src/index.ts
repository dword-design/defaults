import { mapValues, pickBy } from 'lodash-es';

type DeepMerge<TValue, TDefault> = TValue extends null
  ? null
  : TValue extends readonly unknown[]
    ? TDefault extends readonly unknown[]
      ? [...TDefault, ...TValue]
      : TValue
    : TValue extends object
      ? TDefault extends object
        ? {
            [TKey in keyof TValue | keyof TDefault]: TKey extends keyof TValue
              ? TKey extends keyof TDefault
                ? DeepMerge<TValue[TKey], TDefault[TKey]>
                : TValue[TKey]
              : TKey extends keyof TDefault
                ? TDefault[TKey]
                : never;
          }
        : TValue
      : TValue extends undefined
        ? TDefault
        : TValue;

const merge = <TValue, TDefault>(
  value: TValue,
  defaultValue: TDefault,
): DeepMerge<TValue, TDefault> => {
  if (value === null) {
    return null as DeepMerge<TValue, TDefault>;
  }

  if (Array.isArray(value) && Array.isArray(defaultValue)) {
    return [...defaultValue, ...value] as DeepMerge<TValue, TDefault>;
  }

  if (typeof value === 'object') {
    const nonUndefined = pickBy(
      value,
      objectValue => objectValue !== undefined,
    );

    return {
      ...defaultValue,
      ...mapValues(nonUndefined, (objectValue, key) =>
        key in (defaultValue as object)
          ? merge(objectValue, (defaultValue as Record<string, unknown>)[key])
          : objectValue,
      ),
    } as DeepMerge<TValue, TDefault>;
  }

  if (value === undefined) {
    return defaultValue as DeepMerge<TValue, TDefault>;
  }

  return value as DeepMerge<TValue, TDefault>;
};

export default merge;
