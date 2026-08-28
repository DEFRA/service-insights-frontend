import { fetchJson } from '#/server/common/helpers/backend.js'
import { esc, richText, nameOf } from '#/server/common/helpers/format.js'

export const webRegisterListController = {
  async handler(request, h) {
    const q = (request.query.q || '').trim()
    const link = (request.query.link || '').trim()

    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (link) params.set('link', link)
    const query = params.toString() ? `?${params}` : ''
    const { entries, services, totalCount, linkedCount } = await fetchJson(
      `/api/web-register${query}`
    )
    const byLegacyId = new Map(services.map((s) => [s.legacyId, s]))

    const linkItems = [
      { value: '', text: 'All entries' },
      {
        value: 'linked',
        text: 'Matched to a service',
        selected: link === 'linked'
      },
      { value: 'unlinked', text: 'Not matched', selected: link === 'unlinked' }
    ]

    const rows = entries.map((e) => {
      const svc = e.serviceId ? byLegacyId.get(e.serviceId) : null
      const matched = svc
        ? `<a class="govuk-link" href="/service/${esc(svc.slug)}">${esc(nameOf(svc))}</a>`
        : '<span class="govuk-hint govuk-!-margin-0">—</span>'
      return [
        {
          html: `<a class="govuk-link" href="/web-register/${e.legacyId}">${esc(e.summary || e.issueKey || '(no summary)')}</a>`
        },
        { text: e.issueType || '' },
        { text: e.status || '' },
        { html: matched }
      ]
    })

    return h.view('web-register/index', {
      pageTitle: 'Web register',
      q,
      rows,
      linkItems,
      shownCount: entries.length,
      totalCount,
      linkedCount,
      filtered: Boolean(q || link)
    })
  }
}

export const webRegisterEntryController = {
  async handler(request, h) {
    const id = Number(request.params.id)
    const result = Number.isInteger(id)
      ? await fetchJson(`/api/web-register/${id}`)
      : null
    if (!result) {
      return h.view('not-found', { pageTitle: 'Entry not found' }).code(404)
    }
    const { e, svc } = result

    const link = (url) =>
      url
        ? {
            html: `<a class="govuk-link" href="${esc(url)}" rel="noopener noreferrer">${esc(url)}</a>`
          }
        : null
    const text = (v) => (v ? { text: v } : null)

    const detailRows = [
      ['Issue key', text(e.issueKey)],
      ['Type', text(e.issueType)],
      ['Status', text(e.status)],
      ['Department', text(e.department)],
      [
        'Matched service',
        svc
          ? {
              html: `<a class="govuk-link" href="/service/${esc(svc.slug)}">${esc(nameOf(svc))}</a>`
            }
          : null
      ],
      ['External service', link(e.linkExternalService)],
      ['GOV.UK page', link(e.linkGovUk)],
      ['Internal service', link(e.linkInternalService)]
    ]
      .filter(([, v]) => v)
      .map(([key, value]) => ({ key: { text: key }, value }))

    const a11yRows = [
      ['Audited by', text(e.a11yAuditBy)],
      ['Audit type', text(e.a11yAuditType)],
      ['Progress', text(e.a11yProgress)],
      ['Claimed standard', text(e.a11yClaimedStandard)],
      ['Assessed compliance', text(e.a11yAssessedCompliance)],
      ['Disproportionate burden', text(e.a11yDisproportionateBurden)],
      ['Accessibility statement', text(e.a11yStatementPresent)],
      ['Statement URL', link(e.a11yStatementUrl)],
      [
        'Last reviewed',
        e.a11yLastReviewedAt
          ? { text: new Date(e.a11yLastReviewedAt).toISOString().slice(0, 10) }
          : null
      ]
    ]
      .filter(([, v]) => v)
      .map(([key, value]) => ({ key: { text: key }, value }))

    return h.view('web-register/entry', {
      pageTitle: e.summary || e.issueKey || 'Web register entry',
      e: {
        name: e.summary || e.issueKey || '(no summary)',
        descriptionHtml: richText(e.description),
        status: e.status
      },
      detailRows,
      a11yRows
    })
  }
}
