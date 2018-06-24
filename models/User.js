import { DynamoDbSchema, DynamoDbTable, embed } from '@aws/dynamodb-data-mapper'
import emailValidator from 'email-validator'
import config from '../config.json'
import DynamoMapper from '../utils/DynamoMapper'

export class User {}

export class UserMetadata {}

Object.defineProperty(UserMetadata.prototype, DynamoDbSchema, {
  value: {
    verified: {
      type: 'Boolean',
      defaultProvider: () => false
    },
    verifyToken: { type: 'String' }
  }
})

Object.defineProperties(User.prototype, {
  [DynamoDbTable]: {
    value: config.dynamodb.tables.users
  },
  [DynamoDbSchema]: {
    value: {
      email: {
        type: 'String',
        keyType: 'HASH'
      },
      createdAt: {
        type: 'Date',
        keyType: 'RANGE',
        defaultProvider: () => new Date()
      },
      passwordHash: { type: 'String' },
      passwordSalt: { type: 'String' },
      metadata: embed(UserMetadata)
    }
  }
})

export const NewUser = obj => Object.assign(new User(), obj)
export const NewUserMeta = obj => Object.assign(new UserMetadata(), obj)

export async function createUser({
  email,
  passwordHash,
  passwordSalt,
  verifyToken
}) {
  if (!emailValidator.validate(email)) {
    throw `Invalid Email "${email}"`
  }
  let mapper = new DynamoMapper()
  let found = await mapper.get(NewUser({ email })).catch(() => {
    console.info(`Email "${email}" not previously registered`)
  })
  if (found) throw `The email "${email}" is already in use`
  let user = NewUser({
    email,
    passwordHash,
    passwordSalt
  })
  user.metadata = NewUserMeta({
    verifyToken
  })
  await mapper.put({ item: user })
}
