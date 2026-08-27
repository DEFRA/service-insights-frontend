export function buildNavigation(request) {
  return [
    {
      text: 'Services',
      href: '/',
      current: request?.path === '/' || request?.path?.startsWith('/service')
    },
    {
      text: 'Web register',
      href: '/web-register',
      current: request?.path?.startsWith('/web-register')
    }
  ]
}
