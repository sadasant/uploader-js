import lambdaHandler from '../handlers/hello'
import { promisify } from 'util'
const lambda = promisify(lambdaHandler)

describe('hello', () => {
  it('returns what was given', async () => {
    let event = {
      body: 'Example Body'
    }
    let context = {}
    let response = await lambda(event, context)
    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        message: 'Hello!',
        input: event
      })
    })
  })
})
