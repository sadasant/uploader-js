import path from 'path'
import fs from 'fs'
import AWS from 'aws-sdk-mock'
import lambda from '../../handlers/upload'
import { newUserItem, authorizer } from '../testUtils'
const authorizedLambda = authorizer(lambda)

let dynamoCalls = []

describe('upload', () => {
  let email = 'noreply@gmail.com'
  let password = '123IsThisASecurePassword?'
  let fileName = 'My File Name (1).ppt'
  let base64File = fs.readFileSync(
    path.resolve(`${__dirname}/../../misc/isThisAFunMeme.jpg`)
  )

  beforeAll(() => {
    AWS.mock('DynamoDB', 'query', async function(params) {
      dynamoCalls.push(['query', params])
      let email = params.ExpressionAttributeValues[':val1'].S
      return {
        Items: [
          await newUserItem({
            email,
            password
          })
        ]
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
    expect(dynamoCalls.length).toBe(2)
    expect(dynamoCalls[0][0]).toBe('query')
    expect(dynamoCalls[1][0]).toBe('updateItem')
    expect(dynamoCalls[1][1].ExpressionAttributeValues[':val5']).toEqual({
      S: `["${fileName}"]`
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
