import AWS from 'aws-sdk'
import { DataMapper } from '@aws/dynamodb-data-mapper'

export default () =>
  new DataMapper({
    client: new AWS.DynamoDB()
  })
