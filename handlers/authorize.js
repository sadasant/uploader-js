import handler from '../utils/handler'
import checkIn from '../policies/checkIn'

// Our Custom Authorizer.
// Authenticates and fetches the usee with our `checkIn` policy,
// then returns a very specifically formatted object that AWS uses
// to determine wether the request should go to the specified handler or not.
//
// Amazon's official docs are incredible and beautifully detailed:
// https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html
// But if you need to see people using this in other real scenarios, here are
// some of the other sources I found (they shared code! I wonder if they meant to):
// - https://github.com/mcnamee/serverless-jwt-auth/blob/master/auth/VerifyToken.js
// - https://dev.to/piczmar_0/serverless-authorizers---custom-rest-authorizer-16
//
export default handler(checkIn, async event => ({
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
}))
