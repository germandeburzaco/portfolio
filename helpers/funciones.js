const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

function generateRandomNumber() {
  const min = 1000; // El valor mínimo de 4 cifras
  const max = 99999; // El valor máximo de 4 cifras
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


async function misDatosBKP(qry) { //BD ONLINE
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'railway',
    port: 5825,
    connectionLimit: 500,
  });

  const [rows, fields] = await connection.execute(qry);

  return rows
}

async function misDatosLOCAL(qry) {
  console.log(qry)
  try {
    console.log("llegamos a nueva funcion 1");

    const filePath = path.join(__dirname, '../db_offline/db_users.json');

    const data = await fs.readFileSync(filePath, 'utf8');
    console.log("llegamos a nueva funcion 2");

    const users = JSON.parse(data);

    function findUserByUsername(username) {
      return users.find(user => user.user_name === username);
    }

    const usernameToSearch = qry;
    const foundUser = findUserByUsername(usernameToSearch);

    if (foundUser) {
      console.log('Usuario encontrado:', foundUser);
      return [foundUser];
    } else {
      console.log('No se encontró ningún usuario con el user_name:', usernameToSearch);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function misDatos(qry) {

  let db_user = [
    {
      "id": 3394,
      "user_name": "GERMANG",
      "password": "$2b$15$UDaDUNKzhYi4YU43LrtVR./Ph4qveHlMKqpenrtp.FzEnD4hTvF8.",
      "EMAIL": "germandeburzaco@hotmail.com"
    },
    {
      "id": 9794,
      "user_name": "MARIANAM",
      "password": "$2b$15$veuud30WaS5Bp./HyVQyy.0yDPWeQGwMiWKMBJRYKjOlFzIqz5LCi",
      "EMAIL": "marianamolina@live.com"
    }
  ]
  const usernameToSearch = qry;
  const foundUser = db_user.find(user => user.user_name === usernameToSearch);
  return [foundUser];
}

module.exports = {
  generateRandomNumber,
  misDatos
}