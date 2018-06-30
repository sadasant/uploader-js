import sanitize from 'sanitize-filename'
import moment from 'moment'
import handler from '../utils/handler'
import checkIn from '../policies/checkIn'
import { notFound } from '../utils/httpCodes'
import { shareFile } from '../utils/s3'

export default handler(checkIn, async event => {
  let oneDay = 60 * 60 * 24
  let { fileName, expiresAt = oneDay } = event.queryStringParameters
  let cleanFileName = sanitize(fileName)
  let user = event.user
  let files = JSON.parse(user.files || '[]')

  if (!files.includes(cleanFileName)) {
    return notFound(`The file "${cleanFileName}" was not found`)
  }

  if (typeof expiresAt === 'string') {
    // moment().diff() results in a millisecond value
    expiresAt = moment(expiresAt).diff() / 1000
  }

  let shareUrl
  try {
    shareUrl = shareFile(cleanFileName)
  } catch (e) {
    console.info(`Failed to share file "${fileName}"`, e)
    throw `Failed to share file "${fileName}"`
  }

  console.info(`Share URL for file "${fileName}" is ${shareUrl}`)

  return {
    statusCode: 200,
    body: {
      url: shareUrl
    }
  }
})
