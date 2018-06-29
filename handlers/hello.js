import handler from '../utils/handler'

// Hello Hander,
// returns: "Hello!"
export default handler(event => ({
  body: {
    message: 'Hello!',
    input: event
  }
}))
