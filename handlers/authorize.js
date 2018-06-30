import handler from '../utils/handler'
import checkIn from '../policies/checkIn'

export default handler(checkIn, async function authorize(event) {
  // From: ahttps://github.com/mcnamee/serverless-jwt-auth/blob/master/auth/VerifyToken.js
  // Also from: https://dev.to/piczmar_0/serverless-authorizers---custom-rest-authorizer-16
  return {
    principalId: event.user.email,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: event.methodArn
        }
      ]
    }
  }
})
