import tensify from 'tensify'

export default function handlerDeclaration(handler) {
  return async function handlerCaller(event, context, callback) {
    try {
      let response = await handler(event, context)
      try {
        context.succeed(
          response.statusObject || {
            [tensify(handler.name).past]: true
          }
        )
      } catch (e) {
        console.error('failed to context succeed', e)
      }
      callback(null, {
        statusCode: 200,
        ...response,
        body: JSON.stringify(response.body || {})
      })
    } catch (err) {
      console.error('ERROR', err)
      try {
        context.fail(err)
      } catch (e) {
        console.error('failed to context fail', e)
      }
      callback(err)
    }
  }
}
