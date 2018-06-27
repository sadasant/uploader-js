export default function handlerDeclaration(...handlers) {
  return async function handlerCaller(event, context, callback) {
    try {
      if (typeof event.body === 'string') {
        event.body = JSON.parse(event.body)
      }
      let response
      for (let handler of handlers) {
        response = await handler(event, context)
      }
      if (typeof response === 'string') {
        response = {
          body: {
            message: response
          }
        }
      }
      callback(null, {
        statusCode: 200,
        ...response,
        body: JSON.stringify(response.body || {})
      })
    } catch (err) {
      console.error('ERROR', err)
      callback(err)
    }
  }
}
