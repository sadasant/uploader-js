import AWS from 'aws-sdk'
import { DataMapper } from '@aws/dynamodb-data-mapper'

// This utility is a cached instantiator of a DynamoDB DataMapper.
// The idea is that we can invoke it in several places without having
// to worry about leaking memory.
//
// This is specially useful for unit tests, because aws-sdk-mock requires
// that the invokations of AWS (and it's clients) is scoped to happen after
// the declaration of the mocker. So, this cached function can be called as many times
// as needed in each of the individual functons that need access to it, but only generates
// one mapper.
//
let cachedMapper = null
export default () => {
  if (cachedMapper) return cachedMapper
  cachedMapper = new DataMapper({
    client: new AWS.DynamoDB()
  })
  return cachedMapper
}
