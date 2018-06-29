import AWS from 'aws-sdk-mock'
import lambda from '../../handlers/removeUpload'
import { newUserItem, authorizer } from '../testUtils'
const authorizedLambda = authorizer(lambda)

let dynamoCalls = []
let s3Calls = []

describe('removeUpload', () => {
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
    AWS.mock('S3', 'deleteObject', function(params, callback) {
      s3Calls.push(['deleteObject', params])
      callback(null)
    })
  })

  beforeEach(() => {
    dynamoCalls = []
    s3Calls = []
  })

  it('should remove a specific file by fileName', async () => {
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
    expect(s3Calls[0][0]).toBe('deleteObject')
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
