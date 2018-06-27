import 'babel-polyfill'
import 'source-map-support/register'
export const hello = require('./handlers/hello').default
export const register = require('./handlers/register').default
export const unregister = require('./handlers/unregister').default
export const verify = require('./handlers/verify').default
export const listUploads = require('./handlers/listUploads').default
export const shareUpload = require('./handlers/shareUpload').default
export const upload = require('./handlers/upload').default
export const getUload = require('./handlers/getUload').default
export const removeUpload = require('./handlers/removeUpload').default
