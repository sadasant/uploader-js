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
  let failToDelete = false

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
      if (failToDelete) {
        callback(new Error('AWS is Down'))
      } else {
        callback(null)
      }
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
    s3Calls = []
    failToDelete = false
  })

  it('should remove a specific file by fileName', async () => {
    let event = {
      body: JSON.stringify({
        email,
        password
      }),
      queryStringParameters: {
        fileName
      }
    }
    let result = await authorizedLambda(event, {})
    expect(result.statusCode).toBe(200)
    expect(result.body.message).toBe(`File "${fileName}" successfuly removed`)
    expect(s3Calls.length).toBe(1)
    expect(s3Calls[0][0]).toBe('deleteObject')
    expect(dynamoCalls.length).toBe(2)
    expect(dynamoCalls[0][0]).toBe('query')
    expect(dynamoCalls[1][0]).toBe('updateItem')
    expect(dynamoCalls[1][1].ExpressionAttributeValues[':val5']).toEqual({
      S: `[]`
    })
  })

  it("should fail if the user doesn't have this file", async () => {
    let event = {
      body: JSON.stringify({
        email,
        password
      }),
      queryStringParameters: {
        fileName: badFileName
      }
    }
    let result = await authorizedLambda(event, {})
    expect(result.statusCode).toBe(404)
    expect(result.body).toEqual({
      message: `The file "${badFileName}" was not found`
    })
  })

  it('should give the appropriate response if the AWS fails', async () => {
    failToDelete = true
    let event = {
      body: JSON.stringify({
        email,
        password
      }),
      queryStringParameters: {
        fileName
      }
    }
    let result = await authorizedLambda(event, {})
    expect(result.statusCode).toBe(500)
    expect(result.body).toEqual({
      message: `Failed to remove file "${fileName}"`
    })
  })
})
