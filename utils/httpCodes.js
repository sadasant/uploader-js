export const statusBody = statusCode => message => ({
  statusCode,
  body: {
    message
  }
})

export const ok = statusBody(200)
export const noContent = statusBody(204)
export const badRequest = statusBody(400)
export const unauthorized = statusBody(401)
export const forbidden = statusBody(403)
export const notFound = statusBody(404)
export const conflict = statusBody(409)
export const internalServerError = statusBody(500)
