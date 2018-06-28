import AWS from 'aws-sdk-mock'
import lambdaHandler from '../../handlers/authenticate'
import { computeHash } from '../../utils/crypto'
import { promisify } from 'util'
const lambda = promisify(lambdaHandler)

let dynamoCalls = []

describe('authenticate', () => {
  let email = 'noreply@gmail.com'
  let password = '123IsThisASecurePassword?'
  let salt = 'bae'

  beforeAll(() => {
    AWS.mock('DynamoDB', 'query', async function(params) {
      dynamoCalls.push(['query', params])
      let email = params.ExpressionAttributeValues[':val1'].S
      let { hash } = await computeHash(password, salt)
      return {
        Items: [
          {
            email: {
              S: email
            },
            passwordHash: {
              S: hash
            },
            passwordSalt: {
              S: salt
            }
          }
        ]
      }
    })
  })

  beforeEach(() => {
    dynamoCalls = []
  })

  it('should get a token if the credentials are valid', async () => {
    let event = {
      body: JSON.stringify({
        email,
        password
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body).token).toBeDefined()
    expect(dynamoCalls.length).toBe(1)
    expect(dynamoCalls[0][0]).toBe('query')
  })

  it('the token should work to get another token', async () => {
    // It's silly and recursive but it shows that
    // the checkIn policy works
    let event = {
      body: JSON.stringify({
        email,
        password
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(200)
    let token = JSON.parse(result.body).token
    expect(token).toBeDefined()
    expect(dynamoCalls.length).toBe(1)
    expect(dynamoCalls[0][0]).toBe('query')
    event = {
      body: JSON.stringify({
        token
      })
    }
    dynamoCalls = []
    result = await lambda(event, {})
    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body).token).toBeDefined()
    expect(dynamoCalls.length).toBe(1)
    expect(dynamoCalls[0][0]).toBe('query')
  })

  it('should fail if the password is invalid', async () => {
    let event = {
      body: JSON.stringify({
        email,
        password: 'invalid password'
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(500)
    expect(result.body).toBe(`The password doesn't match`)
  })
})
