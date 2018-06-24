export default function handlerDeclaration(handler) {
  return async function handlerCaller(event, context, callback) {
    try {
      let response = await handler(event, context)
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
