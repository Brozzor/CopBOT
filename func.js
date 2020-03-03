const mysql = require('./config');

let timestamp = Math.round(new Date().getTime() / 1000);

exports.timestamp = timestamp;