import { DynamoDbSchema, DynamoDbTable, embed } from '@aws/dynamodb-data-mapper'
import uuid from 'uuid'

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
    value: 'Users'
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
// export default dynamoose.model('User', {
//   id: {
//     type: Number,
//     validate: v => v > 0,
//     hashKey: true
//   },
//   email: {
//     type: String,
//     validate: v => !!v
//   },
//   passwordHash: String,
//   passwordSalt: String,
//   verified: {
//     type: Boolean,
//     default: false
//   },
//   verifyToken: Boolean
// })
