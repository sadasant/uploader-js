import AWS from 'aws-sdk-mock'
import lambda from '../../handlers/shareUpload'
import { newUserItem, authorizer } from '../testUtils'
const authorizedLambda = authorizer(lambda)

let dynamoCalls = []
let s3Calls = []

describe('shareUpload', () => {
  let email = 'noreply@gmail.com'
  let password = '123IsThisASecurePassword?'
  let fileName = 'My File Name (1).ppt'
  let badFileName = 'bad file name'

  beforeAll(() => {
    AWS.mock('DynamoDB', 'query', async function(params) {
      dynamoCalls.push(['query', params])
      let email = params.ExpressionAttributeValues[':val1'].S
      return {
        Items: [
          await newUserItem({
            email,
            password,
            files: [fileName]
          })
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
    let result = await authorizedLambda(event, {})
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
    let result = await authorizedLambda(event, {})
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
    let result = await authorizedLambda(event, {})
    expect(result.statusCode).toBe(200)
    expect(dynamoCalls.length).toBe(1)
    expect(dynamoCalls[0][0]).toBe('query')
    expect(s3Calls.length).toBe(1)
    expect(s3Calls[0][0]).toBe('getSignedUrl')
  })

  it("should fail if the user doesn't have this file", async () => {
    let event = {
      body: JSON.stringify({
        email,
        password,
        fileName: badFileName
      })
    }
    let result = await authorizedLambda(event, {})
    expect(result.statusCode).toBe(404)
    expect(result.body).toEqual({
      message: `The file "${badFileName}" was not found`
    })
  })
})
