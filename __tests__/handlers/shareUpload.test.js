import AWS from 'aws-sdk-mock'
import lambdaHandler from '../../handlers/shareUpload'
import { computeHash } from '../../utils/crypto'
import { promisify } from 'util'
const lambda = promisify(lambdaHandler)

let dynamoCalls = []
let s3Calls = []

describe('shareUpload', () => {
  let email = 'noreply@gmail.com'
  let password = '123IsThisASecurePassword?'
  let fileName = 'My File Name (1).ppt'
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
            },
            files: {
              S: JSON.stringify([fileName])
            }
          }
        ]
      }
    })
    AWS.mock('S3', 'getSignedUrl', async function(params) {
      s3Calls.push(['getSignedUrl', params])
    })
  })

  beforeEach(() => {
    dynamoCalls = []
    s3Calls = []
  })

  it('should retrieve a temporary shareable link for a specific file', async () => {
    let event = {
      body: JSON.stringify({
        email,
        password,
        fileName
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(200)
    expect(dynamoCalls.length).toBe(1)
    expect(dynamoCalls[0][0]).toBe('query')
    expect(s3Calls.length).toBe(1)
    expect(s3Calls[0][0]).toBe('getSignedUrl')
  })

  it('should allow users to specify the expiration date for the file (in seconds)', async () => {
    let event = {
      body: JSON.stringify({
        email,
        password,
        fileName,
        expiresAt: 60 * 60
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(200)
    expect(dynamoCalls.length).toBe(1)
    expect(dynamoCalls[0][0]).toBe('query')
    expect(s3Calls.length).toBe(1)
    expect(s3Calls[0][0]).toBe('getSignedUrl')
  })

  it('should allow users to specify the expiration date for the file (as a string date)', async () => {
    let event = {
      body: JSON.stringify({
        email,
        password,
        fileName,
        expiresAt: '2018-08-08'
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(200)
    expect(dynamoCalls.length).toBe(1)
    expect(dynamoCalls[0][0]).toBe('query')
    expect(s3Calls.length).toBe(1)
    expect(s3Calls[0][0]).toBe('getSignedUrl')
  })

  it('should fail if the password is invalid', async () => {
    let event = {
      body: JSON.stringify({
        email,
        password: 'invalid password',
        fileName
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(500)
    expect(result.body).toBe(`The password doesn't match`)
  })

  it('should fail if the filName is not part of the user’s files', async () => {
    let event = {
      body: JSON.stringify({
        email,
        password,
        fileName: 'bad file name'
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(500)
    expect(result.body).toBe(`The file name "bad file name" was not found`)
  })
})
