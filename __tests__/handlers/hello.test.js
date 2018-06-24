import lambdaHandler from '../../handlers/hello'
import { promisify } from 'util'
const lambda = promisify(lambdaHandler)

describe('hello', () => {
  describe('handler', () => {
    it('returns what was given', async () => {
      let event = {
        body: 'Example Body'
      }
      let context = {
        succeed: jest.fn(),
        fail: jest.fn()
      }
      let response = await lambda(event, context)
      expect(response).toEqual({
        statusCode: 200,
        body: JSON.stringify({
          message: 'Hello!',
          input: event
        })
      })
      expect(context.succeed.mock.calls.length).toBe(1)
      expect(context.succeed.mock.calls[0][0]).toEqual({
        helloed: true
      })
    })
  })
})
