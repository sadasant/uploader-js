import handler from '../utils/handler'
import checkIn from '../policies/checkIn'

// GET to listUploads
// With headers:
//   Authorization: Authorization Token
//
// Results with a body in the shape of:
//   [...Uploaded File Names]
//
// Once the received credentials are validated,
// returns thr file names that were uploaded
// previously.
//
export default handler(checkIn, async event => {
  let { files } = event.user
  let arrayFiles = JSON.parse(files)
  return {
    statusCode: arrayFiles.length ? 200 : 204,
    body: arrayFiles
  }
})
