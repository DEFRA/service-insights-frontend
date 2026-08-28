import { createServer } from '#/server/server.js'

describe('#contentSecurityPolicy', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should set the CSP policy header', async () => {
    // Use /health so the assertion doesn't depend on the backend API that the
    // data pages call — the CSP header is applied to all responses.
    const resp = await server.inject({
      method: 'GET',
      url: '/health'
    })

    expect(resp.headers['content-security-policy']).toBeDefined()
  })
})
