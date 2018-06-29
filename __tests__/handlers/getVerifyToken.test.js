import AWS from 'aws-sdk-mock'
import lambda from '../../handlers/getVerifyToken'
import { newUserItem } from '../testUtils'

let dynamoCalls = []

describe('getVerifyToken', () => {
  let missingEmail = 'missing@email.com'
  let foundEmail = 'found@email.com'
  let password = 'password'
  let verifyToken = 'verifyToken'

  beforeAll(() => {
    AWS.mock('DynamoDB', 'query', async function(params) {
      dynamoCalls.push(['query', params])
      let email = params.ExpressionAttributeValues[':val1'].S
      if (foundEmail === email) {
        return {
          Items: [await newUserItem({ email, password, verifyToken })]
        }
      }
      return {}
    })
  })

  beforeEach(() => {
    dynamoCalls = []
  })

  it('should retrieve the verification token', async () => {
    let event = {
      body: JSON.stringify({
        email: foundEmail,
        password
      })
    }
    let result = await lambda(event, {}).catch(console.info)
    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body).verifyToken).toBeDefined()
    expect(dynamoCalls.length).toBe(1)
    expect(dynamoCalls[0][0]).toBe('query')
  })

  it('should not work if the email is not found', async () => {
    let event = {
      body: JSON.stringify({
        email: missingEmail,
        password
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(500)
    expect(JSON.parse(result.body).message).toBe('Unauthorized')
  })
})
