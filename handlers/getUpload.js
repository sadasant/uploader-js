import AWS from 'aws-sdk'
import sanitize from 'sanitize-filename'
import handler from '../utils/handler'
import checkIn from '../policies/checkIn'
import config from '../config.json'

export default handler(checkIn, async function verify(event) {
  let { fileName } = event.body
  let cleanFileName = sanitize(fileName)
  let s3 = new AWS.S3()
  return s3.getObject({
    Bucket: config.s3.buckets.files,
    Key: cleanFileName
  })
})
