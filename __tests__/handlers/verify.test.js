import AWS from 'aws-sdk-mock'
import lambdaHandler from '../../handlers/verify'
import { promisify } from 'util'
import { computeHash } from '../../utils/crypto'
const lambda = promisify(lambdaHandler)

let dynamoCalls = []

describe('verify', () => {
  let verifiedEmail = 'verified@email.com'
  let unverifiedEmail = 'unverified@email.com'
  let missingEmail = 'missing@email.com'
  let foundEmails = [verifiedEmail, unverifiedEmail]

  let password = 'password'
  let token = 'token'
  let hash
  let salt

  let newUserItem = email => ({
    email: {
      S: email
    },
    passwordHash: {
      S: hash
    },
    passwordSalt: {
      S: salt
    },
    metadata: {
      M: {
        verified: {
          BOOL: email === verifiedEmail
        },
        verifyToken: {
          S: token
        }
      }
    }
  })

  beforeAll(async () => {
    let result = await computeHash(password)
    hash = result.hash
    salt = result.salt
    AWS.mock('DynamoDB', 'query', async function(params) {
      dynamoCalls.push(['query', params])
      let email = params.ExpressionAttributeValues[':val1'].S
      if (foundEmails.includes(email)) {
        return {
          Items: [newUserItem(email)]
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
        token
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(200)
    expect(result.body).toEqual(
      JSON.stringify({
        message: `User "${unverifiedEmail}" has been verified`
      })
    )
    expect(dynamoCalls.length).toBe(2)
    expect(dynamoCalls[0][0]).toBe('query')
    expect(dynamoCalls[1][0]).toBe('updateItem')
  })

  it("should throw if the token doesn't match", async () => {
    let event = {
      body: JSON.stringify({
        email: unverifiedEmail,
        password,
        token: 'bad token'
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(500)
    expect(result.body).toBe("The token doesn't match")
    expect(dynamoCalls.length).toBe(1)
    expect(dynamoCalls[0][0]).toBe('query')
  })

  it("should throw if the password doesn't match", async () => {
    let event = {
      body: JSON.stringify({
        email: unverifiedEmail,
        password: 'bad password',
        token
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(500)
    expect(result.body).toBe("The password doesn't match")
    expect(dynamoCalls.length).toBe(1)
    expect(dynamoCalls[0][0]).toBe('query')
  })

  it('should not verify a verified user', async () => {
    let event = {
      body: JSON.stringify({
        email: verifiedEmail,
        password,
        token
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(500)
    expect(result.body).toBe(
      `The email "${verifiedEmail}" has already been verified`
    )
    expect(dynamoCalls.length).toBe(1)
    expect(dynamoCalls[0][0]).toBe('query')
  })

  it("should throw if the user wasn't found", async () => {
    let event = {
      body: JSON.stringify({
        email: missingEmail
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(500)
    expect(result.body).toBe(`Email "${missingEmail}" not found`)
    expect(dynamoCalls.length).toBe(1)
    expect(dynamoCalls[0][0]).toBe('query')
  })
})
