import tensify from 'tensify'

export default function handlerDeclaration(handler) {
  return async function handlerCaller(event, context, callback) {
    try {
      let response = await handler(event, context)
      context.succeed(
        response.statusObject || {
          [tensify(handler.name).past]: true
        }
      )
      callback(null, {
        statusCode: 200,
        ...response,
        body: JSON.stringify(response.body || {})
      })
    } catch (err) {
      context.fail(err)
      callback(err)
    }
  }
}
