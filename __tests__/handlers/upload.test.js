import path from 'path'
import fs from 'fs'
import AWS from 'aws-sdk-mock'
import lambdaHandler from '../../handlers/upload'
import { computeHash } from '../../utils/crypto'
import { promisify } from 'util'
const lambda = promisify(lambdaHandler)

let dynamoCalls = []

describe('upload', () => {
  let email = 'noreply@gmail.com'
  let password = '123IsThisASecurePassword?'
  let salt = 'bae'
  let base64File = fs.readFileSync(
    path.resolve(`${__dirname}/../../misc/isThisAFunMeme.jpg`)
  )

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
            }
          }
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
    let fileName = 'My Fil Name (1).ppt'
    let event = {
      body: JSON.stringify({
        email,
        password,
        base64File,
        fileName
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body).message).toEqual('Upload Successful')
    expect(dynamoCalls.length).toBe(2)
    expect(dynamoCalls[0][0]).toBe('query')
    expect(dynamoCalls[1][0]).toBe('updateItem')
    expect(dynamoCalls[1][1].ExpressionAttributeNames['#attr6']).toBe(
      'metadata'
    )
    expect(dynamoCalls[1][1].ExpressionAttributeValues[':val5']).toEqual({
      S: `["${fileName}"]`
    })
  })

  it('should fail if the password is invalid', async () => {
    let fileName = 'My Fil Name (1).ppt'
    let event = {
      body: JSON.stringify({
        email,
        password: 'invalid password',
        base64File,
        fileName
      })
    }
    let error
    await lambda(event, {}).catch(err => {
      error = err
    })
    expect(error).toBe(`The password doesn't match`)
  })

  it("should fail if the file type can't be recognized", async () => {
    let base64File = 'gibberish'
    let fileName = 'My Fil Name (1).ppt'
    let event = {
      body: JSON.stringify({
        email,
        password,
        base64File,
        fileName
      })
    }
    let error
    await lambda(event, {}).catch(err => {
      error = err
    })
    expect(error).toBe(`The base64File couldn't be parsed`)
  })
})
