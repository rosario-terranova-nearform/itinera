/// <reference path="../pb_data/types.pb.d.ts" />

// @ts-nocheck — PocketBase JSVM runtime

migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    users.listRule = '@request.auth.role = "admin"'
    users.viewRule = '@request.auth.id = id || @request.auth.role = "admin"'
    users.createRule = '@request.auth.role = "admin"'
    users.updateRule = '@request.auth.id = id || @request.auth.role = "admin"'
    users.deleteRule = '@request.auth.role = "admin"'

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    users.createRule = ''
    users.updateRule = 'id = @request.auth.id'
    users.deleteRule = 'id = @request.auth.id'

    app.save(users)
  },
)
