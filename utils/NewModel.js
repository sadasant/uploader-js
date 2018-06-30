import { DynamoDbSchema, DynamoDbTable } from '@aws/dynamodb-data-mapper'

export default function NewModel({ tableName, properties }) {
  class Model {}

  Object.defineProperties(Model.prototype, {
    [DynamoDbTable]: {
      value: tableName
    },
    [DynamoDbSchema]: {
      value: properties
    }
  })

  return {
    Model
  }
}
