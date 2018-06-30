import handler from '../utils/handler'
import checkIn from '../policies/checkIn'

export default handler(checkIn, async event => {
  let { files } = event.user
  let arrayFiles = JSON.parse(files)
  return {
    statusCode: arrayFiles.length ? 200 : 204,
    body: arrayFiles
  }
})
