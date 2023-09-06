import mysql from 'mysql2';
// const mysql = require('mysql');

const database = mysql.createConnection({
  host: 'localhost',
  user: 'sqluser',
  port: 3306,
  password: 'rkbxK7bN9OGj3bP',
  database: 'chat_db',
});

export default database;
