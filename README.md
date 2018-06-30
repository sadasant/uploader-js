Resources:

- <https://github.com/danilop/LambdAuth/blob/master/LambdAuthCreateUser/index.js>
- <https://github.com/shekhargulati/hands-on-serverless-guide/blob/master/01-aws-lambda-serverless-framework/03-building-rest-api-in-nodejs-with-lambda-gateway-dynamodb-serverless.md>
- <https://aws.amazon.com/blogs/compute/error-handling-patterns-in-amazon-api-gateway-and-aws-lambda/>

Dynamoose and cloudformation:
- https://github.com/dynamoosejs/dynamoose/issues/151
- https://www.npmjs.com/package/dynamoose-to-cloudformation
The above sucks
- https://aws.amazon.com/blogs/developer/introducing-the-amazon-dynamodb-datamapper-for-javascript-developer-preview/#defining-a-model-without-typescript

S3
- <https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html>
- <https://stackoverflow.com/questions/40188287/aws-lambda-function-write-to-s3>
- <https://www.netlify.com/blog/2016/11/17/serverless-file-uploads/>
- <https://docs.aws.amazon.com/AmazonS3/latest/dev/ShareObjectPreSignedURLJavaSDK.html>
- <https://medium.com/@olotintemitope/how-to-upload-files-to-amazon-s3-using-nodejs-lambda-and-api-gateway-bae665127907>
- <https://stackoverflow.com/questions/38831829/nodejs-aws-sdk-s3-generate-presigned-url>
- <https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getSignedUrl-property>

JWT:
- <https://yos.io/2017/09/03/serverless-authentication-with-jwt/>
- <https://github.com/mcnamee/serverless-jwt-auth/blob/master/auth/VerifyToken.js>

Perhaps obvious things that I'm not including:
- I should have discovered this earlier: <https://github.com/dherault/serverless-offline>
- This app is not very REST-friendly (I think it might be CRUD
  friendly, but that might be an overstatement).
- Automatically generated documentation. I know it's a thing in
  serverless/aws lambdas, but I haven't gotten myself there.
- Currently, a user can retrieve more than one jwt token and use them
  independently. In some applications, it makes sense to restrict
  tokens so that only the last one generated is the valid one.
- The database models don't have a migration strategy.
- I'm missing configurations based on the deploy environment.
- A user interface that would access these endpoints.
- Files are not stored in a separate table.
- Multipart uploads.
- Password recovery.

Things I don't understand yet:
- DynamoDB is super tricky. Setting up createdAt as a range key causes
  wreckage in my current way to update. I wasn't successful with
  dynamo-mappers or with dynamoose. I know I will be able to figure
  out why if I start digging up the queries that are sent directly to
  dynamo, and I match them with the documentation that Dynamo has, but
  this is time expensive.
- Why does serverless logs behaves so weird? I haven't figured out how
  to just get the last log, and it seems to loop over older logs, then
  newer, then somehow returns nothing a couple of times, then I get
  the mos recent logs.


- Unauthorized thing.. this took me so long: https://forums.aws.amazon.com/thread.jspa?threadID=226689

curl -d '{"email":"sadasant@gmail.com", "password":"value2"}' -H "Content-Type: application/json" -X POST https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/register
serverless invoke -f register -d '{ "body": "{\"email\":\"sadasant@gmail.com\", \"password\":\"value2\"}" }'
curl -d '{"email":"sadasant@gmail.com", "password":"value2"}' -H "Content-Type: application/json" -X POST https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/register
