import AWS from 'aws-sdk'
import { DataMapper } from '@aws/dynamodb-data-mapper'

let cachedMapper = null
export default () => {
  if (cachedMapper) return cachedMapper
  cachedMapper = new DataMapper({
    client: new AWS.DynamoDB()
  })
  return cachedMapper
}
