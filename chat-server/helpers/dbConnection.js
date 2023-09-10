import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

// const dbHost = process.env.DB_HOST;
// const dbUser = process.env.DB_USER;
// const dbPASSWORD = process.env.DB_PASSWORD;
// const dbPort = process.env.DB_PORT;
// const dbName = process.env.DB_NAME;

const dbHost ='localhost';
const dbUser = 'sqluser';
const dbPASSWORD = process.env.DB_MYPASSWORD;
const dbPort = 3306;
const dbName = 'chat_db';


const database = mysql.createConnection({
  host: dbHost,
  user: dbUser,
  port: dbPort,
  password: dbPASSWORD,
  database: dbName,
});

export default database;
