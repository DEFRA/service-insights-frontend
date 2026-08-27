import { fetchJson } from '#/server/common/helpers/backend.js'
import {
  esc,
  richText,
  nameOf,
  statusTagClass
} from '#/server/common/helpers/format.js'

export const serviceController = {
  async handler(request, h) {
    const result = await fetchJson(
      `/api/services/${encodeURIComponent(request.params.slug)}`
    )
    if (!result) {
      return h.view('not-found', { pageTitle: 'Service not found' }).code(404)
    }
    const { doc, needs, outcomes, userGroups, webEntries, relatedDocs } = result
    const byId = new Map(relatedDocs.map((r) => [String(r._id), r]))

    const s = {
      name: nameOf(doc),
      userFacingName: doc.userFacingName,
      status: doc.status || {},
      statusTagClass: statusTagClass(doc.status?.name),
      deliveryGroup: doc.deliveryGroup || {},
      description: doc.description,
      techOverviewHtml: richText(doc.techOverview),
      legislationHtml: richText(doc.legislation),
      notesHtml: richText(doc.notes),
      enables: (doc.enables || []).filter(Boolean),
      dataDependencies: (doc.dataDependencies || []).filter(Boolean)
    }

    const link = (url) =>
      url
        ? {
            html: `<a class="govuk-link" href="${esc(url)}" rel="noopener noreferrer">${esc(url)}</a>`
          }
        : null
    const text = (v) => (v ? { text: v } : null)
    const summaryRows = [
      ['Lead organisation', text(doc.provider)],
      ['Supporting organisations', text(doc.deliveryPartner)],
      ['Delivery group', text(doc.deliveryGroup?.name)],
      ['Programme', text(doc.programme?.name)],
      ['Type', text(doc.type?.name)],
      ['Channel', text(doc.channel?.name)],
      ['Security classification', text(doc.sensitivity?.name)],
      ['Lifecycle phase', text(doc.deliveryPhase?.name)],
      ['Progress status', text(doc.progressStatus?.name)],
      ['Volume of users', text(doc.volume)],
      ['Transaction volume', text(doc.transactionVolume)],
      ['Service URL', link(doc.url)],
      ['Online guidance', link(doc.onlineGuidance)]
    ]
      .filter(([, value]) => value)
      .map(([key, value]) => ({ key: { text: key }, value }))

    const related = (doc.relationships || []).map((r) => {
      const t = byId.get(String(r.targetId))
      return {
        slug: t?.slug,
        name: t ? nameOf(t) : '(unknown service)',
        type: r.type
      }
    })

    return h.view('service/index', {
      pageTitle: s.name,
      s,
      summaryRows,
      userNeeds: needs.map((n) => n.needText || n.role).filter(Boolean),
      outcomes: outcomes.map((o) => o.name).filter(Boolean),
      userGroups: userGroups.map((g) => g.name).filter(Boolean),
      related,
      webEntries: webEntries.map((w) => ({
        id: w.legacyId,
        summary: w.summary || w.issueKey,
        status: w.status
      }))
    })
  }
}
