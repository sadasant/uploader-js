import AWS from 'aws-sdk-mock'
import lambdaHandler from '../../handlers/unregister'
import { promisify } from 'util'
const lambda = promisify(lambdaHandler)

let dynamoCalls = []

describe('unregister', () => {
  let verifiedEmail = 'verified@email.com'
  let unverifiedEmail = 'unverified@email.com'
  let missingEmail = 'missing@email.com'
  let foundEmails = [verifiedEmail, unverifiedEmail]

  beforeAll(() => {
    AWS.mock('DynamoDB', 'query', async function(params) {
      dynamoCalls.push(['query', params])
      let email = params.ExpressionAttributeValues[':val1'].S
      if (foundEmails.includes(email)) {
        return {
          Items: [
            {
              email: {
                S: email
              },
              metadata: {
                M: {
                  verified: {
                    BOOL: email === verifiedEmail
                  }
                }
              }
            }
          ]
        }
      }
      return {}
    })
    AWS.mock('DynamoDB', 'deleteItem', async function(params) {
      dynamoCalls.push(['deleteItem', params])
      return {}
    })
  })

  beforeEach(() => {
    dynamoCalls = []
  })

  it("should delete the user if it's not verified", async () => {
    let event = {
      body: JSON.stringify({
        email: unverifiedEmail
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(200)
    expect(result.body).toEqual(
      JSON.stringify({
        message: `User "${unverifiedEmail}" successfully removed`
      })
    )
    expect(dynamoCalls.length).toBe(2)
    expect(dynamoCalls[0][0]).toBe('query')
    expect(dynamoCalls[1][0]).toBe('deleteItem')
  })

  it('should not delete a verified user', async () => {
    let event = {
      body: JSON.stringify({
        email: verifiedEmail
      })
    }
    let error
    await lambda(event, {}).catch(err => {
      error = err
    })
    expect(error).toBe(`The email "${verifiedEmail}" has been verified`)
    expect(dynamoCalls.length).toBe(1)
    expect(dynamoCalls[0][0]).toBe('query')
  })

  it("should throw if the user wasn't found", async () => {
    let event = {
      body: JSON.stringify({
        email: missingEmail
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(200)
    expect(result.body).toEqual(
      JSON.stringify({
        message: `Email "${missingEmail}" not found`
      })
    )
    expect(dynamoCalls.length).toBe(1)
    expect(dynamoCalls[0][0]).toBe('query')
  })
})
