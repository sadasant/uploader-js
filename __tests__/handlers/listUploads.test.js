import AWS from 'aws-sdk-mock'
import lambdaHandler from '../../handlers/listUploads'
import { computeHash } from '../../utils/crypto'
import { promisify } from 'util'
const lambda = promisify(lambdaHandler)

let dynamoCalls = []

describe('listUploads', () => {
  let email = 'noreply@gmail.com'
  let password = '123IsThisASecurePassword?'
  let salt = 'bae'
  let files

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
              S: JSON.stringify(files)
            }
          }
        ]
      }
    })
  })

  beforeEach(() => {
    files = ['My Fil Name (1).ppt']
    dynamoCalls = []
  })

  it('should retrieve the user previously uploaded files', async () => {
    let event = {
      body: JSON.stringify({
        email,
        password
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(200)
    expect(result.files).toEqual(files)
    expect(dynamoCalls.length).toBe(1)
    expect(dynamoCalls[0][0]).toBe('query')
  })

  it('should fail if the password is invalid', async () => {
    let event = {
      body: JSON.stringify({
        email,
        password: 'invalid password'
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(500)
    expect(result.body).toBe(`The password doesn't match`)
  })

  it("should fail if the user hasn't uploaded any file", async () => {
    files = []
    let event = {
      body: JSON.stringify({
        email,
        password
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(500)
    expect(result.body).toBe(`User "${email}" has not uploaded any file.`)
  })
})
