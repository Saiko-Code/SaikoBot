const mysql = require("mysql");

module.exports = async () => {
    console.log("📡 Tentative de connexion à la base de données...");

    let db = mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: "saiko",
        password: "saikoserver",
        database: "saiko_bot"
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
