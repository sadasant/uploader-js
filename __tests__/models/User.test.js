import { User, createUser } from '../../models/User'
import config from '../../config.json'
import AWS from 'aws-sdk-mock'

let dynamoCalls = []

describe('User', () => {
  let uniqueEmail = 'unique@email.com'
  let duplicatedEmail = 'duplicated@email.com'
  let badEmail = 'bad email com'

  beforeAll(() => {
    AWS.mock('DynamoDB', 'putItem', function(params, callback) {
      dynamoCalls.push(['putItem', params])
      callback(null, 'successfully put item in database')
    })
    AWS.mock('DynamoDB', 'getItem', function(params, callback) {
      dynamoCalls.push(['getItem', params])
      if (params.Key.email.S === duplicatedEmail) {
        callback(null, {
          Item: new User()
        })
      } else {
        callback(new Error('Not found error'))
      }
    })
  })
  beforeEach(() => {
    dynamoCalls = []
  })
  describe('createUser', () => {
    it('should put an item in the configured DynamoDB table', async () => {
      await createUser({
        email: uniqueEmail,
        passwordHash: 'hash',
        passwordSalt: 'salt',
        verifyToken: 'token'
      })
      expect(dynamoCalls.length).toBe(2)
      expect(dynamoCalls[0][0]).toBe('getItem')
      expect(dynamoCalls[1][0]).toBe('putItem')
      expect(dynamoCalls[1][1].TableName).toBe(config.dynamodb.tables.users)
      expect(Object.keys(dynamoCalls[1][1].Item)).toEqual([
        'email',
        'createdAt',
        'passwordHash',
        'passwordSalt',
        'metadata'
      ])
    })
    it('should not work if the email is invalid', async () => {
      let errors = []
      try {
        await createUser({
          email: badEmail,
          passwordHash: 'hash',
          passwordSalt: 'salt',
          verifyToken: 'token'
        })
      } catch (e) {
        errors.push(e)
      }
      expect(errors.length).toBe(1)
      expect(errors[0]).toBe(`Invalid Email "${badEmail}"`)
      expect(dynamoCalls.length).toBe(0)
    })
    it('should not work if the email is duplicated', async () => {
      let errors = []
      try {
        await createUser({
          email: duplicatedEmail,
          passwordHash: 'hash',
          passwordSalt: 'salt',
          verifyToken: 'token'
        })
      } catch (e) {
        errors.push(e)
      }
      expect(errors.length).toBe(1)
      expect(errors[0]).toBe(`The email "${duplicatedEmail}" is already in use`)
      expect(dynamoCalls.length).toBe(1)
      expect(dynamoCalls[0][0]).toBe('getItem')
    })
  })
})
