import AWS from 'aws-sdk-mock'
import lambdaHandler from '../../handlers/register'
import config from '../../config.json'
import { promisify } from 'util'
const lambda = promisify(lambdaHandler)

let dynamoCalls = []

describe('register', () => {
  beforeAll(() => {
    AWS.mock('DynamoDB', 'putItem', function(params, callback) {
      dynamoCalls.push(['putItem', params])
      callback(null, 'successfully put item in database')
    })
    AWS.mock('DynamoDB', 'query', async function(params) {
      dynamoCalls.push(['query', params])
      return {}
    })
  })
  beforeEach(() => {
    dynamoCalls = []
  })
  it('should put an item in the configured DynamoDB table', async () => {
    let email = 'noreply@gmail.com'
    let password = '123IsThisASecurePassword?'
    let event = {
      body: JSON.stringify({
        email,
        password
      })
    }
    let result = await lambda(event, {})
    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body).token).toBeDefined()
    expect(dynamoCalls.length).toBe(2)
    expect(dynamoCalls[0][0]).toBe('query')
    expect(dynamoCalls[1][0]).toBe('putItem')
    expect(dynamoCalls[1][1].TableName).toBe(config.dynamodb.tables.users)
  })
})
