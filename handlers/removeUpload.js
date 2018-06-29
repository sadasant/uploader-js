import AWS from 'aws-sdk'
import sanitize from 'sanitize-filename'
import handler from '../utils/handler'
import checkIn from '../policies/checkIn'
import config from '../config.json'
import { notFound } from '../utils/httpCodes'

export default handler(checkIn, async event => {
  let { fileName } = event.body
  let cleanFileName = sanitize(fileName)
  let s3 = new AWS.S3()
  let user = event.user
  if (user.files && !user.files.includes(cleanFileName)) {
    return notFound(`The file "${cleanFileName}" was not found`)
  }
  return s3.deleteObject({
    Bucket: config.s3.buckets.files,
    Key: cleanFileName
  })
})
