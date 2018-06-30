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
  let missingFileName = 'missingFileName.jpg'
  let bufferFile = fs.readFileSync(
    path.resolve(`${__dirname}/../../misc/${fileName}`)
  )
  let base64File = new Buffer(bufferFile).toString('base64')
  let failDownload = false

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
      if (failDownload) {
        callback(new Error('Failed to Download'))
      } else {
        callback(null, {
          Body: bufferFile
        })
      }
    })
  })

  beforeEach(() => {
    dynamoCalls = []
    s3Calls = []
    failDownload = false
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

  it('should give the appropriate response if the file does not belong to the user', async () => {
    let event = {
      body: JSON.stringify({
        email,
        password
      }),
      queryStringParameters: {
        fileName: missingFileName
      }
    }
    let result = await authorizedLambda(event, {})
    expect(result.statusCode).toBe(404)
    expect(result.body.message).toBe(
      `The file "${missingFileName}" was not found`
    )
    expect(dynamoCalls.length).toBe(1)
    expect(dynamoCalls[0][0]).toBe('query')
  })

  it('should give the appropriate response if we failed to download the file', async () => {
    failDownload = true
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
    expect(result.body.message).toBe(`Failed to download file "${fileName}"`)
    expect(dynamoCalls.length).toBe(1)
    expect(dynamoCalls[0][0]).toBe('query')
  })
})
