let mysql = require("mysql");
let util = require('util');

let conn = mysql.createConnection({
    database: "",
    host: "",
    user: "",
    password: ""
  });

const query = util.promisify(conn.query).bind(conn);
exports.conn = conn;
exports.query = query;
