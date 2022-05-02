/**
 * Map an array using an async callback.
 *
 * Executes recursively.
 *
 * @export
 * @template T Type of items in array.
 * @template U Type returned from the callback.
 * @param {Array<T>} iterable
 * @param {(currentValue: T, index: number, array: Array<T>) => Promise<U>} callback
 * @param {number} [index=0]
 * @returns {Promise<Array<U>>}
 */
export async function asyncMap(iterable, callback, index = 0) {
  if (!Array.isArray(iterable)) {
    throw new Error('parameter "iterable" should be an array');
  }
  if (index < iterable.length) {
    const result = await callback(iterable[index], index, iterable);
    return [result, ...(await asyncMap(iterable, callback, index + 1))];
  }

  return [];
}

/**
 * Iterate over an array using an async callback.
 *
 * Executes recursively.
 *
 * @export
 * @template T Type of items in array.
 * @param {Array<T>} iterable
 * @param {(currentValue: T, index: number, array: iterable) => Promise<void>} callback
 * @param {number} [index=0]
 * @returns {Promise<void>}
 */
export async function asyncForEach(iterable, callback, index = 0) {
  if (!Array.isArray(iterable)) {
    throw new Error('parameter "iterable" should be an array');
  }
  if (index < iterable.length) {
    await callback(iterable[index], index, iterable);
    await asyncForEach(iterable, callback, index + 1);
  }
}

/**
 * Reduce an array using an async callback.
 *
 * Executes recursively.
 *
 * @export
 * @template T Type of items in array.
 * @template U Type of accumulator/initialValue.
 * @param {Array<T>} iterable
 * @param {(
 *   accumulator: U,
 *   currentValue: T,
 *   index: number,
 *   array: iterable,
 * ) => Promise<any>} callback
 * @param {U} initialValue
 * @param {number} [index=0]
 * @returns {Promise<U>}
 */
export async function asyncReduce(iterable, callback, initialValue, index = 0) {
  if (!Array.isArray(iterable)) {
    throw new Error('parameter "iterable" should be an array');
  }
  if (index < iterable.length) {
    const newAccumulator = await callback(initialValue, iterable[index], index, iterable);
    return asyncReduce(iterable, callback, newAccumulator, index + 1);
  }

  return initialValue;
}
