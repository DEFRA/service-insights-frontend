import {
  webRegisterListController,
  webRegisterEntryController
} from './controller.js'

export const webRegister = {
  plugin: {
    name: 'web-register',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/web-register',
          ...webRegisterListController
        },
        {
          method: 'GET',
          path: '/web-register/{id}',
          ...webRegisterEntryController
        }
      ])
    }
  }
}
