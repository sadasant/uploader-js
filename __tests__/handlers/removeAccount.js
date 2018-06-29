import AWS from 'aws-sdk-mock'
import lambdaHandler from '../../handlers/removeAccount'
import { computeHash } from '../../utils/crypto'
import { promisify } from 'util'
const lambda = promisify(lambdaHandler)

let dynamoCalls = []

describe('removeAccount', () => {
  let email = 'noreply@gmail.com'
  let password = '123IsThisASecurePassword?'
  let salt = 'bae'

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
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(200)
    expect(result.body).toEqual(
      JSON.stringify({
        message: `User "${email}" successfully removed`
      })
    )
    expect(dynamoCalls.length).toBe(2)
    expect(dynamoCalls[0][0]).toBe('query')
    expect(dynamoCalls[1][0]).toBe('deleteItem')
  })

  it('should fail if the password is invalid', async () => {
    let event = {
      body: JSON.stringify({
        email,
        password: 'invalid password'
      })
    }
    let error
    await lambda(event, {}).catch(err => {
      error = err
    })
    expect(error).toBe(`The password doesn't match`)
  })
})
