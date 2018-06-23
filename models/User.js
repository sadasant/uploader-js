import { DynamoDbSchema, DynamoDbTable, embed } from '@aws/dynamodb-data-mapper'
import uuid from 'uuid'
import config from '../config.json'

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
      id: {
        type: 'String',
        keyType: 'HASH',
        defaultProvider: uuid.v4
      },
      createdAt: {
        type: 'Date',
        keyType: 'RANGE'
      },
      email: { type: 'String' },
      passwordHash: { type: 'String' },
      passwordSalt: { type: 'String' },
      metadata: embed(UserMetadata)
    }
  }
})
