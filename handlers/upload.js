import fileType from 'file-type'
import sanitize from 'sanitize-filename'
import dynamoMapper from '../utils/dynamoMapper'
import handler from '../utils/handler'
import checkIn from '../policies/checkIn'
import { badRequest, conflict } from '../utils/httpCodes'
import { uploadFile } from '../utils/s3'

// POST to upload with:
//   { fileName: String, base64File: String }
// With headers:
//   Authorization: Authorization Token
//
// Results with a body in the shape of:
//   { message: String }
//
// Once the received credentials are validated,
// saves the base64File in Amazon S3.
//
// The received fileName will be sanitized
// using [sanitize-filename](https://www.npmjs.com/package/sanitize-filename).
//
// Will fail if the base64File doesn't have recognizable binaries.
// Here is a [list of the supported file types](https://www.npmjs.com/package/file-type#supported-file-types).
//
// Will also fail if the fileName does not belong to the user's files.
//
export default handler(checkIn, async event => {
  let { base64File, fileName } = event.body

  let buffer = new Buffer(base64File, 'base64')
  let fileMime = fileType(buffer)
  if (fileMime === null) {
    return badRequest("The base64File couldn't be parsed")
  }

  let cleanFileName = sanitize(fileName)
  await uploadFile(cleanFileName, buffer)

  let user = event.user
  let files = JSON.parse(user.files)
  if (files.includes(cleanFileName))
    return conflict(`This user already has a file with the same name`)

  user.files = JSON.stringify(files.concat(cleanFileName))

  let mapper = dynamoMapper()
  await mapper.update(user)
  return 'Upload Successful'
})
