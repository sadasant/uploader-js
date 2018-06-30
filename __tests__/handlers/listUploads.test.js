import AWS from 'aws-sdk-mock'
import lambda from '../../handlers/listUploads'
import { newUserItem, authorizer } from '../testUtils'
const authorizedLambda = authorizer(lambda)

let dynamoCalls = []

describe('listUploads', () => {
  let email = 'noreply@gmail.com'
  let password = '123IsThisASecurePassword?'
  let files

  beforeAll(() => {
    AWS.mock('DynamoDB', 'query', async function(params) {
      dynamoCalls.push(['query', params])
      let email = params.ExpressionAttributeValues[':val1'].S
      return {
        Items: [await newUserItem({ email, password, files })]
      }
    })
  })

  beforeEach(() => {
    files = ['My File Name (1).ppt']
    dynamoCalls = []
  })

  it('should retrieve the user previously uploaded files', async () => {
    let event = {
      body: JSON.stringify({
        email,
        password
      })
    }
    let result = await authorizedLambda(event, {})
    expect(result.statusCode).toBe(200)
    expect(result.body).toEqual(files)
    expect(dynamoCalls.length).toBe(1)
    expect(dynamoCalls[0][0]).toBe('query')
  })

  it("should return no content if the user doesn't have files", async () => {
    files = []
    let event = {
      body: JSON.stringify({
        email,
        password
      })
    }
    let result = await authorizedLambda(event, {})
    expect(result.statusCode).toBe(204)
    expect(result.body).toEqual([])
  })
})
