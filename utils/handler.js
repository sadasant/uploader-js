export default function handlerDeclaration(...handlers) {
  return async function handlerCaller(event, context, callback) {
    try {
      if (typeof event.body === 'string') {
        try {
          event.body = JSON.parse(event.body)
        } catch (e) {
          console.info('The body was not a valid JSON', event.body)
        }
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
      callback(null, {
        statusCode: 500,
        body: err
      })
    }
  }
}
