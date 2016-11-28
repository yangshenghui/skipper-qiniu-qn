/**
 * @Author Eridanus Sora <sora@sound.moe>
 * Another Skipper Recevier for Sails.
 */

var Writable = require('stream').Writable;
var _ = require('lodash');
var mime = require('mime');
var qn = require('qn');
var fs = require('fs');

module.exports = function SkipperQiniu(globalOptions) {
  globalOptions = globalOptions || {};

  var adapter = {
    receive: QiniuReceiver
  };

  return adapter;

  /**
   * A simple receiver for Skipper that writes Upstreams to Qiniu Storage
   * to the configured container at the configured path.
   *
   * @param {Object} options
   * @returns {Stream.Writable}
   */
  function QiniuReceiver(options) {
    options = options || {};
    options = _.defaults(options, globalOptions);

    var client = qn.create({
      accessKey: options.accessKey,
      secretKey: options.secretKey,
      bucket: options.bucket,
    });

    var receiver = Writable({
      objectMode: true
    });

    receiver.once('error', function (err) {
      console.log('ERROR ON RECEIVER__ ::',err);
    });

    receiver._write = function(newFile, encoding, next) {
      newFile.once('error', function (err) {
         console.log('ERROR ON file read stream in receiver (%s) ::', newFile.filename, err);
      });

      var headers = options.headers || {};

      client.upload(newFile, {
        filename: options.filename || newFile.fd,
        key: options.key || newFile.fd
      }, function (err, result) {
        if (err){
            return next(err);
        }

        return next(undefined, result);
      });
    }
    return receiver;
  }
};
