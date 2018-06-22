import handler from '../utils/handler'

// Hello Hander,
// returns: "Hello!"
export default handler(function hello(event) {
  return {
    body: {
      message: 'Hello!',
      input: event
    }
  }
})
