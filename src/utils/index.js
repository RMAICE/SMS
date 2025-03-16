/**
 * @param {number} ms
 */
export function delay(ms) {
  return new Promise(res => setTimeout(res, ms))
}

/**
 * @param {Object} siteObj
 * @param {string} siteObj.host
 * @param {string} siteObj.protocol
 */
export function getSiteUrl({ host, protocol }) {
  return `${protocol}//${host}/`
}
