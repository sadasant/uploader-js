import path from 'path'
import fs from 'fs'
import AWS from 'aws-sdk-mock'
import lambda from '../../handlers/getUpload'
import { newUserItem, authorizer } from '../testUtils'
const authorizedLambda = authorizer(lambda)

let dynamoCalls = []
let s3Calls = []

describe('getUpload', () => {
  let email = 'noreply@gmail.com'
  let password = '123IsThisASecurePassword?'
  let fileName = 'isThisAFunMeme.jpg'
  let bufferFile = fs.readFileSync(
    path.resolve(`${__dirname}/../../misc/${fileName}`)
  )
  let base64File = new Buffer(bufferFile).toString('base64')

  beforeAll(() => {
    AWS.mock('DynamoDB', 'query', async function(params) {
      dynamoCalls.push(['query', params])
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
    AWS.mock('S3', 'getObject', function(params, callback) {
      s3Calls.push(['getObject', params])
      callback(null, {
        Body: bufferFile
      })
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
        password
      }),
      queryStringParameters: {
        fileName
      }
    }
    let result = await authorizedLambda(event, {})
    expect(result.statusCode).toBe(200)
    expect(result.body.base64File).toBe(base64File)
    expect(dynamoCalls.length).toBe(1)
    expect(dynamoCalls[0][0]).toBe('query')
    expect(s3Calls.length).toBe(1)
  })
})
