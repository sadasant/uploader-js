import AWS from 'aws-sdk-mock'
import lambda from '../../handlers/removeAccount'
import { newUserItem, authorizer } from '../testUtils'
const authorizedLambda = authorizer(lambda)

let dynamoCalls = []

describe('removeAccount', () => {
  let email = 'noreply@gmail.com'
  let password = '123IsThisASecurePassword?'

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
    AWS.mock('DynamoDB', 'deleteItem', async function(params) {
      dynamoCalls.push(['deleteItem', params])
      return {}
    })
  })

  beforeEach(() => {
    dynamoCalls = []
  })

  it('should delete the user', async () => {
    let event = {
      body: JSON.stringify({
        email,
        password
      })
    }
    let result = await authorizedLambda(event, {})
    expect(result.statusCode).toBe(200)
    expect(result.body).toEqual({
      message: `User "${email}" successfully removed`
    })
    expect(dynamoCalls.length).toBe(2)
    expect(dynamoCalls[0][0]).toBe('query')
    expect(dynamoCalls[1][0]).toBe('deleteItem')
  })
})
