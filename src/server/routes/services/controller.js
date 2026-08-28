import { fetchJson } from '#/server/common/helpers/backend.js'
import { esc, nameOf, statusTagClass } from '#/server/common/helpers/format.js'

export const servicesController = {
  async handler(request, h) {
    const q = (request.query.q || '').trim()
    const dg = (request.query.dg || '').trim()

    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (dg) params.set('dg', dg)
    const query = params.toString() ? `?${params}` : ''
    const { services, groups, totalCount } = await fetchJson(
      `/api/services${query}`
    )

    const dgItems = [{ value: '', text: 'All delivery groups' }].concat(
      groups.map((g) => ({
        value: g.slug,
        text: g.name,
        selected: g.slug === dg
      }))
    )

    const rows = services.map((s) => {
      const flag = s.userFacingName
        ? ''
        : '<span class="app-internal-flag">Internal name</span>'
      const status = s.status?.name
        ? `<strong class="govuk-tag ${statusTagClass(s.status.name)}">${esc(s.status.name)}</strong>`
        : ''
      return [
        {
          html: `<a class="govuk-link" href="/service/${esc(s.slug)}">${esc(nameOf(s))}</a>${flag}`
        },
        { text: s.deliveryGroup?.name || '' },
        { text: s.provider || '' },
        { html: status }
      ]
    })

    return h.view('services/index', {
      pageTitle: 'Services',
      q,
      rows,
      dgItems,
      shownCount: services.length,
      totalCount,
      filtered: Boolean(q || dg)
    })
  }
}
