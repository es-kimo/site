/**
 * 두 배열을 zip하여 튜플 배열로 결합합니다.
 *
 * @param arr1 - 첫 번째 배열
 * @param arr2 - 두 번째 배열
 * @returns 두 배열의 요소들을 튜플로 결합한 배열
 *
 * @example
 * ```typescript
 * const names = ['Alice', 'Bob', 'Charlie'];
 * const ages = [25, 30, 35];
 * const zipped = zip(names, ages);
 * // 결과: [['Alice', 25], ['Bob', 30], ['Charlie', 35]]
 * ```
 */
export function zip<T, U>(arr1: readonly T[], arr2: readonly U[]): [T, U][] {
  const minLength = Math.min(arr1.length, arr2.length);
  const result: [T, U][] = new Array(minLength);

  for (let i = 0; i < minLength; i++) {
    result[i] = [arr1[i]!, arr2[i]!];
  }

  return result;
}

/**
 * 세 개의 배열을 zip하여 튜플 배열로 결합합니다.
 *
 * @param arr1 - 첫 번째 배열
 * @param arr2 - 두 번째 배열
 * @param arr3 - 세 번째 배열
 * @returns 세 배열의 요소들을 튜플로 결합한 배열
 */
export function zip3<T, U, V>(arr1: readonly T[], arr2: readonly U[], arr3: readonly V[]): [T, U, V][] {
  const minLength = Math.min(arr1.length, arr2.length, arr3.length);
  const result: [T, U, V][] = new Array(minLength);

  for (let i = 0; i < minLength; i++) {
    result[i] = [arr1[i]!, arr2[i]!, arr3[i]!];
  }

  return result;
}

/**
 * 여러 배열을 zip하여 튜플 배열로 결합합니다.
 *
 * @param arrays - zip할 배열들의 배열
 * @returns 여러 배열의 요소들을 튜플로 결합한 배열
 */
export function zipMany<T extends readonly unknown[]>(...arrays: T[]): T[number][][] {
  if (arrays.length === 0) return [];

  const minLength = Math.min(...arrays.map((arr) => arr.length));
  const result: T[number][][] = new Array(minLength);

  for (let i = 0; i < minLength; i++) {
    result[i] = arrays.map((arr) => arr[i]!);
  }

  return result;
}

/**
 * 두 배열을 zip하여 객체 배열로 결합합니다.
 *
 * @param keys - 키 배열
 * @param values - 값 배열
 * @returns 키-값 쌍으로 구성된 객체 배열
 *
 * @example
 * ```typescript
 * const keys = ['name', 'age', 'city'];
 * const values = ['Alice', 25, 'New York'];
 * const objects = zipToObjects(keys, values);
 * // 결과: [{name: 'Alice'}, {age: 25}, {city: 'New York'}]
 * ```
 */
export function zipToObjects<K extends string, V>(keys: readonly K[], values: readonly V[]): Record<K, V>[] {
  const minLength = Math.min(keys.length, values.length);
  const result: Record<K, V>[] = new Array(minLength);

  for (let i = 0; i < minLength; i++) {
    const key = keys[i]!;
    const value = values[i]!;
    result[i] = { [key]: value } as Record<K, V>;
  }

  return result;
}
