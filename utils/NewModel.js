import { DynamoDbSchema, DynamoDbTable } from '@aws/dynamodb-data-mapper'

// Creates the object structure that is dynamodb-data-mapper needs.
// This is an attempt to make the model declaration a bit less verbose.
// To use this function, you need to pass the tableName and a list of
// properties. Please check the documentaiton of this repo if you need
// any other clarification: https://github.com/awslabs/dynamodb-data-mapper-js
//
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
