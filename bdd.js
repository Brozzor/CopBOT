let mysql = require("mysql");
let util = require('util');

let conn = mysql.createConnection({
    database: "copbot",
    host: "164.132.46.160",
    user: "copbot1",
    password: "NgF6Sy9zi6TOt7f7"
  });

const query = util.promisify(conn.query).bind(conn);
exports.conn = conn;
exports.query = query;