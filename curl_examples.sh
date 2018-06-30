verifyToken=$(curl \
  -d '{"email":"sadasant2@gmail.com", "password":"value2"}' \
  -H "Content-Type: application/json" \
  -X POST https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/register | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['verifyTOken'])")

token=$(curl \
  -d '{"email":"sadasant2@gmail.com", "password":"value2"}' \
  -H "Content-Type: application/json" \
  -X POST https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/getAuthToken | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")

curl \
  -d "{\"verifyToken\": \"$verifyToken\"}" \
  -H "Content-Type: application/json" \
  -H "Authorization: $token" \
  -X POST https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/verify

# NOTE: Might need to get a fresh token for this
base64File="$(base64 -w 0 misc/isThisAFunMeme.jpg)"
curl \
  -d "{\"base64File\": \"$base64File\", \"fileName\": \"isThisAFunMeme.jpg\"}" \
  -H "Content-Type: application/json" \
  -H "Authorization: $token" \
  -X POST https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/upload

# NOTE: Might need to get a fresh token for this
curl -H "Authorization: $token" \
  https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/listUploads

# NOTE: Might need to get a fresh token for this
curl -H "Authorization: $token" \
  https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/shareUpload?fileName=isThisAFunMeme.jpg

# NOTE: Might need to get a fresh token for this
base64File=$(curl -H "Authorization: $token" \
  https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/getUpload?fileName=isThisAFunMeme.jpg |  \
  python3 -c "import sys, json; print(json.load(sys.stdin)['base64File'])")
# To it's original form:
# base64 -d <<< $base64File > isThisAFunMeme.jpg
# To view it from a terminal (sudo apt-get install caca-utils):
# cacaview isThisAFunMeme.jpg

# NOTE: Might need to get a fresh token for this
curl -H "Authorization: $token" \
  -X DELETE https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/removeUpload?fileName=isThisAFunMeme.jpg

curl \
  -d '{"email":"sadasant2@gmail.com"}' \
  -H "Content-Type: application/json" \
  -X POST https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/unregister

curl -H "Authorization: $token" \
  -X DELETE https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/removeAccount
