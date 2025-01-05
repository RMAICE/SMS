/**
 * @template {string} K
 * @template {object} O
 * @param {K} k
 * @param {O} obj
 * @returns {obj is O & Record<K, unknown>}
 */
export function hasKey(k, obj) {
  return k in obj
}

/**
 * @template {unknown} K
 * @param {K} k
 * @returns {k is K & object}
 */
export function isObject(k) {
  return typeof k === 'object' && k !== null
}

/**
 * @template {unknown} K
 * @param {K} v
 * @returns {v is K & string}
 */
export function isString(v) {
  return typeof v === 'string'
}

/**
 * @param {unknown} arr
 * @returns {arr is unknown[]}
 */
export function isArray(arr) {
  return Array.isArray(arr)
}
