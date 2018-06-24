import { DynamoDbSchema, DynamoDbTable, embed } from '@aws/dynamodb-data-mapper'

export default function NewModel({ tableName, properties, metadata }) {
  class Model {}
  class Metadata {}

  Object.defineProperty(Metadata.prototype, DynamoDbSchema, {
    value: metadata
  })

  Object.defineProperties(Model.prototype, {
    [DynamoDbTable]: {
      value: tableName
    },
    [DynamoDbSchema]: {
      value: {
        ...properties,
        metadata: embed(Metadata)
      }
    }
  })

  return {
    Model,
    Metadata
  }
}
