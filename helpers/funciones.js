const mysql = require('mysql2/promise');

function generateRandomNumber() {
    const min = 1000; // El valor mínimo de 4 cifras
    const max = 99999; // El valor máximo de 4 cifras
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


async function misDatos(qry) {
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

module.exports = {
    generateRandomNumber,
    misDatos
}