import AWS from 'aws-sdk'
import sanitize from 'sanitize-filename'
import moment from 'moment'
import handler from '../utils/handler'
import checkIn from '../policies/checkIn'
import config from '../config.json'
import { notFound } from '../utils/httpCodes'

export default handler(checkIn, async event => {
  let oneDay = 60 * 60 * 24
  let { fileName, expiresAt = oneDay } = event.body
  let cleanFileName = sanitize(fileName)

  let user = event.user
  if (user.files && !user.files.includes(cleanFileName)) {
    return notFound(`The file "${cleanFileName}" was not found`)
  }

  let s3 = new AWS.S3()
  if (typeof expiresAt === 'string') {
    expiresAt = moment(expiresAt).diff() / 1000
  }

  return s3.getSignedUrl('getObject', {
    Bucket: config.s3.buckets.files,
    Key: cleanFileName,
    // moment().diff() results in a millisecond value
    Expires: expiresAt
  })
})
