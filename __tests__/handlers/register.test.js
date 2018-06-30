import AWS from 'aws-sdk-mock'
import lambda from '../../handlers/register'
import config from '../../config.json'
import { newUserItem } from '../testUtils'

let dynamoCalls = []

describe('register', () => {
  let newEmail = 'new@email.com'
  let foundEmail = 'found@email.com'
  let badEmail = 'bad email'
  let password = 'password'
  let failUserCreation = false

  beforeAll(() => {
    AWS.mock('DynamoDB', 'query', async function(params) {
      dynamoCalls.push(['query', params])
      let email = params.ExpressionAttributeValues[':val1'].S
      if (foundEmail === email) {
        return {
          Items: [await newUserItem({ email, password })]
        }
      }
      return {}
    })
    AWS.mock('DynamoDB', 'putItem', function(params, callback) {
      dynamoCalls.push(['putItem', params])
      if (failUserCreation) {
        callback(new Error('S3 is Down'))
      } else {
        callback(null, 'successfully put item in database')
      }
    })
  })

  beforeEach(() => {
    dynamoCalls = []
    failUserCreation = false
  })

  it('should put an item in the configured DynamoDB table', async () => {
    let event = {
      body: JSON.stringify({
        email: newEmail,
        password
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body).verifyToken).toBeDefined()
    expect(dynamoCalls.length).toBe(2)
    expect(dynamoCalls[0][0]).toBe('query')
    expect(dynamoCalls[1][0]).toBe('putItem')
    expect(dynamoCalls[1][1].TableName).toBe(config.dynamodb.tables.users)
    expect(Object.keys(dynamoCalls[1][1].Item)).toEqual([
      'email',
      'createdAt',
      'passwordHash',
      'passwordSalt',
      'files',
      'verified',
      'verifyToken'
    ])
  })

  it('should not work if the email is invalid', async () => {
    let event = {
      body: JSON.stringify({
        email: badEmail,
        password
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(400)
    expect(JSON.parse(result.body).message).toBe(`Invalid Email "${badEmail}"`)
    expect(dynamoCalls.length).toBe(0)
  })

  it('should not work if the email is duplicated', async () => {
    let event = {
      body: JSON.stringify({
        email: foundEmail,
        password
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(409)
    expect(JSON.parse(result.body).message).toBe(
      `The email "${foundEmail}" has already been registered`
    )
    expect(dynamoCalls.length).toBe(1)
    expect(dynamoCalls[0][0]).toBe('query')
  })

  it('should give the proper error message if the user creation fails', async () => {
    failUserCreation = true
    let event = {
      body: JSON.stringify({
        email: newEmail,
        password
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(500)
    expect(result.body.message).toBe(
      `Failed to create user "${newEmail}"`
    )
    expect(dynamoCalls.length).toBe(2)
    expect(dynamoCalls[0][0]).toBe('query')
    expect(dynamoCalls[1][0]).toBe('putItem')
  })
})
