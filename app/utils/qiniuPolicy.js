function Mac(accessKey, secretKey) {
  this.accessKey = accessKey || conf.ACCESS_KEY;
  this.secretKey = secretKey || conf.SECRET_KEY;
}

// ----- token --------
function PutPolicy(scope, callbackUrl, callbackBody, returnUrl, returnBody, endUser, expires, persistentOps, persistentNotifyUrl) {
  this.scope = scope || null;
  this.callbackUrl = callbackUrl || null;
  this.callbackBody = callbackBody || null;
  this.returnUrl = returnUrl || null;
  this.returnBody = returnBody || null;
  this.endUser = endUser || null;
  this.expires = expires || 3600;
  this.persistentOps = persistentOps || null;
  this.persistentNotifyUrl = persistentNotifyUrl || null;
}
// @endgist

PutPolicy.prototype.token = function(mac) {
  if (mac == null) {
    mac = new Mac(conf.ACCESS_KEY, conf.SECRET_KEY);
  }
  var flags = this.getFlags();
  var encodedFlags = util.urlsafeBase64Encode(JSON.stringify(flags));
  var encoded = util.hmacSha1(encodedFlags, mac.secretKey);
  var encodedSign = util.base64ToUrlSafe(encoded);
  var uploadToken = mac.accessKey + ':' + encodedSign + ':' + encodedFlags;
  return uploadToken;
}

PutPolicy.prototype.getFlags = function() {
  var flags = {};
  var attrs = ['scope', 'insertOnly', 'saveKey', 'endUser', 'returnUrl', 'returnBody', 'callbackUrl', 'callbackHost', 'callbackBody', 'callbackBodyType', 'callbackFetchKey', 'persistentOps', 'persistentNotifyUrl', 'persistentPipeline', 'fsizeLimit', 'detectMime', 'mimeLimit'];

  for (var i = attrs.length - 1; i >= 0; i--) {
    if (this[attrs[i]] !== null) {
      flags[attrs[i]] = this[attrs[i]];
    }
  }

  flags['deadline'] = this.expires + Math.floor(Date.now() / 1000);

  return flags;
}
