import { computeHash, storeUser } from '../../handlers/register'
import config from '../../config.json'
import AWS from 'aws-sdk-mock'
// import lambdaHandler from '../../handlers/register'
// import { promisify } from 'util'
// const lambda = promisify(lambdaHandler)

let dynamoCalls = []

describe('register', () => {
  beforeAll(() => {
    AWS.mock('DynamoDB', 'putItem', function(params, callback) {
      dynamoCalls.push(['putItem', params])
      callback(null, 'successfully put item in database')
    })
  })
  beforeEach(() => {
    dynamoCalls = []
  })
  describe('utilities', () => {
    describe('computeHash', () => {
      it('should not break for a given password', async () => {
        let password = '123IsThisASecurePassword?'
        let { salt, hash } = await computeHash(password)
        expect(salt).toBeDefined()
        expect(hash).toBeDefined()
      })
    })
    describe('storeUser', () => {
      it('should put an item in the configured DynamoDB table', async () => {
        let email = 'noreply@gmail.com'
        let password = '123IsThisASecurePassword?'
        let { salt } = await computeHash(password)
        let token = await storeUser(email, password, salt)
        expect(token).toBeDefined()
        expect(dynamoCalls.length).toBe(1)
        expect(dynamoCalls[0][0]).toBe('putItem')
        expect(dynamoCalls[0][1].TableName).toBe(config.dynamodb.tables.users)
      })
    })
  })
})
