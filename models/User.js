import emailValidator from 'email-validator'
import config from '../config.json'
import dynamoMapper from '../utils/dynamoMapper'
import { make } from '../utils/lang'
import NewModel from '../utils/NewModel'
import { computeHash } from '../utils/crypto'

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
    passwordSalt: { type: 'String' },
    files: { type: 'String' }
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
  let found = await findUser({ email })
  if (found) throw `The email "${email}" is already in use`
  let user = make(User, {
    email,
    passwordHash,
    passwordSalt
  })
  user.metadata = make(UserMetadata, {
    verifyToken
  })
  let mapper = dynamoMapper()
  await mapper.put({ item: user })
}

export async function findUser(query) {
  let mapper = dynamoMapper()
  let found
  for await (const user of mapper.query(User, query)) {
    found = user
  }
  return found
}

export async function getVerifiedUser(email, password) {
  let found = await findUser({ email })
  if (!found) throw `Email "${email}" not found`
  let { hash } = await computeHash(password, found.passwordSalt)
  if (found.passwordHash !== hash) throw "The password doesn't match"
  return found
}
