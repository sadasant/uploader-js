import 'babel-polyfill'
import 'source-map-support/register'

export default Object.assign({}, 
        ['register', 
        'unregister', 
        'removeAcount', 
        'verify', 
        'listUploads', 
        'shareUpload', 
        'upload', 
        'removeUpload', 
        'authorize', 
        'getAuthToken', 
        'getVerifyToken']
    .map((handlerName) => ({[handlerName]: require('./handlers/'+handlerName).default}) ))
