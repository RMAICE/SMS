import site from '#entities/site/index.js'

export async function getAllMappedSites() {
  const sites = await site.getAll()
  /** @type {Map<string, number>} */
  const map = new Map()

  for (const site of sites)
    map.set(site.url, site.site_id)

  return map
}

/**
 * @param {object} params
 * @param {string} params.domain
 * @param {T.Transaction} [trx]
 */
export async function getOrCreateSiteId({ domain }, trx) {
  const sitesMap = await getAllMappedSites()
  let siteId = sitesMap.get(domain)

  if (siteId)
    return siteId

  const result = await site.insertOne({ url: domain }, trx)

  siteId = result.rows[0].site_id
  sitesMap.set(domain, siteId)

  return siteId
}
