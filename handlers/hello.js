import handler from '../utils/handler'

// POST to hello with anything
// Results with a body in the shape of:
//   { message: 'Hello!', input: What was received }
//
export default handler(event => ({
  body: {
    message: 'Hello!',
    input: event
  }
}))
