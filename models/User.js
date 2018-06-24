import emailValidator from 'email-validator'
import config from '../config.json'
import DynamoMapper from '../utils/DynamoMapper'
import { make } from '../utils/lang'
import NewModel from '../utils/NewModel'

const model = NewModel({
  tableName: config.dynamodb.tables.users,
  properties: {
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
    passwordSalt: { type: 'String' }
  },
  metadata: {
    verified: {
      type: 'Boolean',
      defaultProvider: () => false
    },
    verifyToken: { type: 'String' }
  }
})

export const User = model.Model
export const UserMetadata = model.Metadata

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
  for await (const user of mapper.query(User, { email })) {
    if (user) throw `The email "${email}" is already in use`
  }
  let user = make(User, {
    email,
    passwordHash,
    passwordSalt
  })
  user.metadata = make(UserMetadata, {
    verifyToken
  })
  await mapper.put({ item: user })
}
