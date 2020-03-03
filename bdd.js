let mysql = require("mysql");

let conn = mysql.createConnection({
    database: "copbot",
    host: "164.132.46.160",
    user: "copbot1",
    password: "NgF6Sy9zi6TOt7f7"
  });

exports.conn = conn;