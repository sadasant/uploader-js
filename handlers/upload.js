import fileType from 'file-type'
import sanitize from 'sanitize-filename'
import dynamoMapper from '../utils/dynamoMapper'
import handler from '../utils/handler'
import checkIn from '../policies/checkIn'
import { badRequest, conflict } from '../utils/httpCodes'
import { uploadFile } from '../utils/s3'

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
