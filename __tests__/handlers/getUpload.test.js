import AWS from 'aws-sdk-mock'
import lambdaHandler from '../../handlers/getUpload'
import { computeHash } from '../../utils/crypto'
import { promisify } from 'util'
const lambda = promisify(lambdaHandler)

let dynamoCalls = []
let s3Calls = []

describe('getUpload', () => {
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
    AWS.mock('S3', 'getObject', function(params, callback) {
      s3Calls.push(['getObject', params])
      callback(null)
    })
  })

  beforeEach(() => {
    dynamoCalls = []
    s3Calls = []
  })

  it('should retrieve a specific file by fileName', async () => {
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
})
