import AWS from 'aws-sdk-mock'
import lambda from '../../handlers/verify'
import { newUserItem, authorizer } from '../testUtils'
const authorizedLambda = authorizer(lambda)

let dynamoCalls = []

describe('verify', () => {
  let verifiedEmail = 'verified@email.com'
  let unverifiedEmail = 'unverified@email.com'
  let foundEmails = [verifiedEmail, unverifiedEmail]
  let password = 'password'
  let verifyToken = 'token'

  beforeAll(async () => {
    AWS.mock('DynamoDB', 'query', async function(params) {
      dynamoCalls.push(['query', params])
      let email = params.ExpressionAttributeValues[':val1'].S
      if (foundEmails.includes(email)) {
        return {
          Items: [
            await newUserItem({
              email,
              password,
              verified: email === verifiedEmail,
              verifyToken: email === unverifiedEmail ? verifyToken : undefined
            })
          ]
        }
      }
      return {}
    })
    AWS.mock('DynamoDB', 'updateItem', async function(params) {
      dynamoCalls.push(['updateItem', params])
      return {
        Attributes: {}
      }
    })
  })

  beforeEach(() => {
    dynamoCalls = []
  })

  it("should verify the user if it's not verified", async () => {
    let event = {
      body: JSON.stringify({
        email: unverifiedEmail,
        password,
        verifyToken
      })
    }
    let result = await authorizedLambda(event, {})
    expect(result.statusCode).toBe(200)
    expect(result.body).toEqual({
      message: `User "${unverifiedEmail}" has been verified`
    })
    expect(dynamoCalls.length).toBe(2)
    expect(dynamoCalls[0][0]).toBe('query')
    expect(dynamoCalls[1][0]).toBe('updateItem')
  })

  it("should throw if the verifyToken doesn't match", async () => {
    let event = {
      body: JSON.stringify({
        email: unverifiedEmail,
        password,
        verifyToken: 'bad token'
      })
    }
    let result = await authorizedLambda(event, {})
    expect(result.statusCode).toBe(403)
    expect(result.body).toEqual({
      message: "The token doesn't match"
    })
    expect(dynamoCalls.length).toBe(1)
    expect(dynamoCalls[0][0]).toBe('query')
  })

  it('should not verify a verified user', async () => {
    let event = {
      body: JSON.stringify({
        email: verifiedEmail,
        password,
        verifyToken
      })
    }
    let result = await authorizedLambda(event, {})
    expect(result.statusCode).toBe(409)
    expect(result.body).toEqual({
      message: `The email "${verifiedEmail}" has already been verified`
    })
    expect(dynamoCalls.length).toBe(1)
    expect(dynamoCalls[0][0]).toBe('query')
  })
})
