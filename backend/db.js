require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 8889,  // Ajout du port
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "percepteurs_db",
});

db.connect((err) => {
    if (err) {
        console.error("❌ Erreur de connexion à MariaDB :", err);
        return;
    }
    console.log("✅ Connecté à MariaDB !");
});

module.exports = db;