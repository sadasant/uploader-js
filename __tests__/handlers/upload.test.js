import path from 'path'
import fs from 'fs'
import AWS from 'aws-sdk-mock'
import lambda from '../../handlers/upload'
import { newUserItem, authorizer } from '../testUtils'
const authorizedLambda = authorizer(lambda)

let dynamoCalls = []
let s3Calls = []

describe('upload', () => {
  let email = 'noreply@gmail.com'
  let password = '123IsThisASecurePassword?'
  let fileName = 'isThisAFunMeme.jpg'
  let bufferFile = fs.readFileSync(
    path.resolve(`${__dirname}/../../misc/${fileName}`)
  )
  let base64File = new Buffer(bufferFile).toString('base64')
  let savedFiles = []

  beforeAll(() => {
    AWS.mock('DynamoDB', 'query', async function(params) {
      dynamoCalls.push(['query', params])
      let email = params.ExpressionAttributeValues[':val1'].S
      return {
        Items: [
          await newUserItem({
            email,
            password,
            files: savedFiles
          })
        ]
      }
    })
    AWS.mock('S3', 'putObject', function(params, callback) {
      s3Calls.push(['putObject', params])
      savedFiles.push(fileName)
      callback(null, {})
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
  })

  it("should upload a file to Amazon S3 and change the user's list of files", async () => {
    let event = {
      body: JSON.stringify({
        email,
        password,
        base64File,
        fileName
      })
    }
    let result = await authorizedLambda(event, {})
    expect(result.statusCode).toBe(200)
    expect(result.body.message).toBe('Upload Successful')
    expect(s3Calls.length).toBe(1)
    expect(s3Calls[0][0]).toBe('putObject')
    expect(dynamoCalls.length).toBe(2)
    expect(dynamoCalls[0][0]).toBe('query')
    expect(dynamoCalls[1][0]).toBe('updateItem')
    expect(dynamoCalls[1][1].ExpressionAttributeValues[':val5']).toEqual({
      S: `["${fileName}"]`
    })
  })

  it('should fail if the user already has a file with the same name', async () => {
    let event = {
      body: JSON.stringify({
        email,
        password,
        base64File,
        fileName
      })
    }
    let result = await authorizedLambda(event, {})
    expect(result.statusCode).toBe(409)
    expect(result.body).toEqual({
      message: `This user already has a file with the same name`
    })
  })

  it("should fail if the file type can't be recognized", async () => {
    let base64File = 'gibberish'
    let event = {
      body: JSON.stringify({
        email,
        password,
        base64File,
        fileName
      })
    }
    let result = await authorizedLambda(event, {})
    expect(result.statusCode).toBe(400)
    expect(result.body).toEqual({
      message: `The base64File couldn't be parsed`
    })
  })
})
