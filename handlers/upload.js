import AWS from 'aws-sdk'
import sanitize from 'sanitize-filename'
import fileType from 'file-type'
import dynamoMapper from '../utils/dynamoMapper'
import handler from '../utils/handler'
import checkIn from '../policies/checkIn'
import config from '../config.json'

export default handler(checkIn, async function verify(event) {
  let { base64File, fileName } = event.body
  let buffer = new Buffer(base64File, 'base64')
  let fileMime = fileType(buffer)
  if (fileMime === null) {
    throw "The base64File couldn't be parsed"
  }
  let s3 = new AWS.S3()
  let cleanFileName = sanitize(fileName)
  await s3.putObject({
    Bucket: config.s3.buckets.files,
    Key: cleanFileName,
    Body: base64File
    // ACL: 'public-read'
  })
  let user = event.user
  user.files = JSON.stringify(
    JSON.parse(user.files || '[]').concat(cleanFileName)
  )
  let mapper = dynamoMapper()
  await mapper.update(user)
  return 'Upload Successful'
})
