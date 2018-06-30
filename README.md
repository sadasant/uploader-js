## Fancy Uploader In JavaScript

Here's a fully working MVP for a file uploader. I did it to **learn
about serverless**, making some compromises in the technology I wanted
to use and more or less how I wanted to structure the files. We'll get
into that later.

This File Uploader™️  has the following features:
- Allows user registration and user verification.
- Allows further authentication via JWT tokens.
- Allows file uploads 🚀 to the cloud ☁️
- Allows users to list their uploads, and remove them.
- Allows users to generate temporary links to access these files.

![](https://i.imgur.com/lkEd8L4.gif)

Here is a list of features that are probably only important for
developers:
- It's built on NodeJS 💐
- It uses the latest Babel & EcmaScript features I could find at the
  moment.
- It's fully **unit tested** 💪
- It is stored on AWS using serverless. sls super cool 😎
- It uses Prettier and Eslint, so no ugly code on sight!
- It runs lint and test validations on CircleCI on pull requests!

## How to build

### Getting in the Console

The first step is actually not with the repo, but with your AWS
account:
1. Get in the [AWS Console](https://console.aws.amazon.com/).
2. Go to the IAM section. We need to crete a user.
3. Create a user, give it `Programmatic access`.
4. Give it full `List`, `Read` & `Write` access to `CloudFormation`.
5. Give it `IAMFullAccess`.
6. Give it `AmazonDynamoDBFullAccess`.
7. Give it `AmazonAPIGatewayAdministrator`.
8. Give it `AmazonAPIGatewayAdministrator`.
9. Give it `CloudFrontFullAccess`.
10. Give it `AmazonS3FullAccess`.
11. Give it `AWSLambdaFullAccess`.

Now you're ready for the terminal.

### Installing Dependencies

You'll need NodeJS. So far, I like using
[nvm](https://github.com/creationix/nvm) since it gives you the
freedom to move back and forward between one version and another.
Just as they say in their README, you can install NVM with:

    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

You'll also need [serverless](https://serverless.com/). The quick
guide says:

    npm install -g serverless
    # Updating serverless from a previous version of serverless
    npm install -g serverless
    # Login to the serverless platform (optional)
    serverless login

It will ask you the credentials of an IAM user. Put the credentials of
the user you just created.

After that, I highly recommend reading the serverless CLI reference (I
tend to forget about the `info` commmand): <https://serverless.com/framework/docs/providers/azure/cli-reference/>

### Repository Initialization

You can do it this way:
```
git clonse git@github.com:sadasant/uploader-js.git
```

Then `cd uploader-js`. Followed by `npm install`.

At this point, you're **ready**, this is yours now, play with it,
break it, submit issues back, learn with me! You can start by running
the tests:

    npm t

Or by deploying it yourself:

    serverless deploy --force

## I want to try it now!

I have this deployed (and open to the public, for a brief period of
time), in the following endpoints:

    POST - https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/register
    POST - https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/unregister
    POST - https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/getAuthToken
    POST - https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/getVerifyToken
    POST - https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/verify
    DELETE - https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/removeAccount
    GET - https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/listUploads
    GET - https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/shareUpload
    POST - https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/upload
    GET - https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/getUpload
    DELETE - https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/removeUpload

Let's use CURL to start using these endpoints right now (here is a
[curl crash
course](http://pewniak747.info/2012/10/27/curl-crash-course/), just in
case):

1. `POST register`: The registration process requires sending an email
and a password, which will result in a JSON object with a single
`verifyToken` property, which you will use to verify yourself. _I'm
mimicking the email verification processes_.

```bash
email="lurker@hotmail.com"
password="avocadoPower!1234"
verifyToken=$(curl \
  -d "{\"email\":\"$email", \"password\":\"$password\"}" \
  -H "Content-Type: application/json" \
  -X POST https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/register | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['verifyToken'])")
echo "Your verification token is: $verifyToken"
```

2. `POST unregister`: As long as you haven't verified yourself, you
can unregister with:

```bash
email="lurker@hotmail.com"
curl \
  -d "{\"email\":\"$email"}' \
  -H "Content-Type: application/json" \
  -X POST https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/unregister
```

3. `POST getAuthToken`: Allows you to retrieve an authorization token
that you will be able to send to other endpoints on the
`Authorization` header. You need to send the `email` and the
`password`, and if all goes well, you'll receive a JSON object with a
singple property: `token`.

```bash
token=$(curl \
  -d "{\"email\":\"$email", \"password\":\"$password\"}" \
  -H "Content-Type: application/json" \
  -X POST https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/getAuthToken | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")
```

4. `POST getVerifyToken`: Allows you to retrieve again your
`verifyToken`, in case you lost it. Requires sending the `user` and
`password` again.
 
5. `POST verify`: Allows you to verify yourself. Nothing special
happens afterwards. It's just a mimick of email verification.

```bash
curl \
  -d "{\"verifyToken\": \"$verifyToken\"}" \
  -H "Content-Type: application/json" \
  -H "Authorization: $token" \
  -X POST https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/verify
```

6. `DELETE removeAccount`: Allows you to remove your own account.

```bash
curl -H "Authorization: $token" \
  -X DELETE https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/removeAccount
```

7. `GET listUploads`: Will return a list of file names that have been
uploaded previously. Empty if no file names have been uploaded so far.

**NOTE:** You might need to re-generate another token by calling
`getAuthToken` again.

```bash
curl -H "Authorization: $token" \
  https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/listUploads
```

8. `GET shareUpload`: Will generate a shareable link to one of your
downloads. Requires you to send (in the query parameters) the `fileName`
you want to share, and optionally an `expiresAt` property with either
a valid string date of a date in the future, or the number of seconds
you want the shareable link to be active.

```bash
curl -H "Authorization: $token" \
  https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/shareUpload?fileName=isThisAFunMeme.jpg
```

9. `POST upload`: Allows you to upload files. You'll need to send a
JSON body with two properties: `fileName`, which will hold the name of
the file, and a `base64File` property that will hold the base64
represenation of the file contents. You can try it with an image that
comes with this repository, in the folder `misc`, as the following
example shows:

```bash
base64File="$(base64 -w 0 misc/isThisAFunMeme.jpg)"
curl \
  -d "{\"base64File\": \"$base64File\", \"fileName\": \"isThisAFunMeme.jpg\"}" \
  -H "Content-Type: application/json" \
  -H "Authorization: $token" \
  -X POST https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/upload
```

10. `GET getUpload`: Since you have an authorized token for your own
account, you can retrieve this file (base64 encoded) with a simple
call to this endpoint:

_**Note:** This was probably better called `getFile`, now that I think
of it._

```bash
base64File=$(curl -H "Authorization: $token" \
  https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/getUpload?fileName=isThisAFunMeme.jpg |  \
  python3 -c "import sys, json; print(json.load(sys.stdin)['base64File'])")
```

If you want to transform it to it's original form, you can do it in
the console with the following command:

    base64 -d <<< $base64File > isThisAFunMeme.jpg

If you are a console freak (and/or you happen to be in Debian), you can view it without
leaving the terminal by installing `sudo apt-get install caca-utils` and running:

    cacaview isThisAFunMeme.jpg

11. `DELETE removeUpload`: Finally, you can remove your own account by
calling thi endpoint as follows:

```bash
curl -H "Authorization: $token" \
  -X DELETE https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/removeAccount
```

## Pros / Cons

## My reasoning while building this

## Things I am sure I missed

## Things I need to study

## Subjective Pros / Cons

## License

## Shout Out To My Crew

---

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
- I know I could reuse the JWT token for the verification token, I
  don't think it adds any practical benefit over code reduction. It
  seemed expensive and I wanted to move on to other studies.
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
