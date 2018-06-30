import sanitize from 'sanitize-filename'
import handler from '../utils/handler'
import dynamoMapper from '../utils/dynamoMapper'
import checkIn from '../policies/checkIn'
import { notFound } from '../utils/httpCodes'
import { removeFile } from '../utils/s3'

// DELETE to removeUpload
// With a query object similar  to:
//   ?fileName=String
//
// With headers:
//   Authorization: Authorization Token
//
// Results with a body in the shape of:
//   { message: String }
//
// Once the received credentials are validated,
// removes the requested file.
//
export default handler(checkIn, async event => {
  let { fileName } = event.queryStringParameters
  let user = event.user
  let files = JSON.parse(user.files)

  let cleanFileName = sanitize(fileName)
  if (user.files && !user.files.includes(cleanFileName)) {
    return notFound(`The file "${cleanFileName}" was not found`)
  }

  try {
    await removeFile(cleanFileName)
  } catch (e) {
    console.info(`Failed to remove file "${fileName}"`, e.message)
    throw `Failed to remove file "${fileName}"`
  }

  user.files = JSON.stringify(files.filter(file => file !== cleanFileName))
  let mapper = dynamoMapper()
  await mapper.update(user)

  return `File "${cleanFileName}" successfuly removed`
})
