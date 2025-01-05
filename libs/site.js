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
 * @param {Awaited<ReturnType<typeof getAllMappedSites>>} params.sitesMap
 */
export async function getOrCreateSiteId({ domain, sitesMap }) {
  let siteId = sitesMap.get(domain)

  if (siteId)
    return siteId

  siteId = await site.insertOne({ url: domain })

  sitesMap.set(domain, siteId)

  return siteId
}
