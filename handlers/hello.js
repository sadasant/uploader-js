import handler from '../util/handler'

// Hello Hander,
// returns: "Hello!"
export default handler((event, context) => ({
  body: {
    message: 'Hello!',
    input: event
  }
}))
