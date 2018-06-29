import { internalServerError } from './httpCodes'

export default function handlerDeclaration(...handlers) {
  return async function handlerCaller(event, context) {
    // Let's make sure the body is an object.
    // It is probably safe to assume that if we receive
    // a body it will be a string, but I'd rather not
    // think about the alternative.
    if (typeof event.body === 'string') {
      try {
        event.body = JSON.parse(event.body)
      } catch (e) {
        console.info('The body was not a valid JSON', event.body)
      }
    }

    let response
    for (let handler of handlers) {
      try {
        response = await handler(event, context)
      } catch (e) {
        if (event.methodArn) {
          return context.fail(e)
        }
        return internalServerError(e.message || e)
      }
      if (response) break
    }

    if (typeof response === 'string') {
      response = {
        body: {
          message: response
        }
      }
    }

    if (event.methodArn) {
      return context.succeed(response)
    }

    return {
      statusCode: 200,
      ...response,
      body: JSON.stringify(response.body || {})
    }
  }
}
