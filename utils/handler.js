import { internalServerError } from './httpCodes'

// This function is designed to be a wrapper for all of our lambda handlers.
// It tries to convert the event.body to an object,
// It also allows receiving more than one handler, so the concept of "policies" or middlewares can emerge.
// As soon as any of the received handlers return a non-empty value, it stops looping through them.
//
// If any handler throws, it will return a properly parsed internal server error response instead.
// It does log the error as well so we can debug it.
//
// If the event has a `methodArn` property, this means that this handler call is piped by AWS,
// where the system is expecting this to notify wether it should go to the next handler or not.
// The context's success or fail function will be called accordingly.
//
// It is redundant to have multiple handlers here and also have
// a multi-layered authentication process desigend by serverless and AWS,
// but the benefits of having this function is that it allows for handlers composition,
// where a single handler can be used by multiple other handlers where a specific operation
// is commonly needed.
//
// Another important feature is that having a single step responsible of
// defining response strategies is essential to provide a smooth API for
// declaring handlers. Thanks to this feature, handlers can simply return
// strings and have them used as the body's message value for a 200 response,
// as well as throw and trust this function to produce a properly formatted
// internalServerError, or to fail the context appropriately.
//
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
        console.info('The body was not a valid JSON')
      }
    }

    let response
    for (let handler of handlers) {
      try {
        response = await handler(event, context)
      } catch (e) {
        console.info('Handler Error', e)
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
