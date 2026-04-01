const mysql = require("mysql");

module.exports = async () => {
    console.log("📡 Tentative de connexion à la base de données...");

    let db = mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    db.connect((err) => {
        if (err) {
            console.error("❌ Erreur de connexion à la base de données :", err);
            return;
        }
        console.log("✅ Connexion réussie à la base de données !");
    });

    // Log chaque requête exécutée (optionnel, pour debug)
    db.on('query', (query) => {
        console.log("📊 Requête SQL exécutée :", query.sql);
    });

    db.on('error', (err) => {
        console.error("⚠️ Erreur SQL détectée :", err);
    });

    return db;
};
