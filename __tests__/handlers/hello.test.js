import lambdaHandler from '../../handlers/hello'
import { promisify } from 'util'
import testContext from '../../utils/testContext'
const lambda = promisify(lambdaHandler)

describe('hello', () => {
  describe('handler', () => {
    it('returns what was given', async () => {
      let event = {
        body: 'Example Body'
      }
      let context = testContext()
      let response = await lambda(event, context)
      expect(response).toEqual({
        statusCode: 200,
        body: JSON.stringify({
          message: 'Hello!',
          input: event
        })
      })
      expect(context.calls.length).toBe(1)
      expect(context.calls[0][0]).toBe('succeed')
    })
  })
})
