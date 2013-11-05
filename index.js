var hyperquest = require('hyperquest');
var _ = require('underscore');

var data_re = /data:\s+(\{?.*\}?)/;
var event_re = /event:\s+(.*)/;

var buildRequest = (require('reconnect-core'))(function() {
  return hyperquest.apply(null, arguments);
});

function RivuletClient(path) {
  this.path = path;
  this.connect();
}

(require('util')).inherits(RivuletClient, require('events').EventEmitter);

RivuletClient.prototype.connect = function() {
  this.__connection = buildRequest(
    {immediate: true}, 
    _.bind(this.onConnect, this)
  ).connect(this.path);
}

RivuletClient.prototype.onConnect = function(stream) {
  stream.on('data', _.bind(this.handleData, this));
  process.nextTick(_.bind(function() {
    this.emit('connect', this);
  }, this));
}

RivuletClient.prototype.handleData = function(data) {
  if (typeof data == 'object')
    data = data.toString();
  _.each(_.compact(data.split("\n")), _.bind(this.handleLine, this));
}

RivuletClient.prototype.handleLine = function(line) {
  var match;
  if (match = line.match(data_re))
    this.emitEvent(JSON.parse(match[1]));
  else if (match = line.match(event_re))
    this._event = match[1];
}

RivuletClient.prototype.emitEvent = function(data) {
  process.nextTick(_.bind(function() {
    this.emit(this._event || 'data', data);
    this._event = null;
  }, this));
}

RivuletClient.prototype.disconnect = function() {
  this.__connection && this.__connection.disconnect();
}

module.exports = RivuletClient;
