<div align="center">
  <img src="https://img.shields.io/badge/Discord.js-14.16-blue?style=for-the-badge&logo=discord" alt="Discord.js" />
  <img src="https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=nodedotjs" alt="Node.js" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker" alt="Docker" />
  <img src="https://img.shields.io/badge/MySQL-Supported-4479A1?style=for-the-badge&logo=mysql" alt="MySQL" />
</div>

<br />

# 🤖 SaikoBot

Bienvenue sur le dépôt de **SaikoBot** !  
Conçu initialement pour protéger les serveurs Discord et géré divers services, ce bot multifonction est codé en JavaScript avec la célèbre librairie `discord.js`.

SaikoBot est conçu avec un système avancé qui utilise `canvas` pour la génération d'images, communique avec l'API **Pterodactyl** (via `nodeactyl`), interroge les statuts de serveurs de jeux vidéo (comme Minecraft avec `minecraft-server-util` et d'autres jeux avec `gamedig`), tout en stockant intelligemment ses données dans une base **MySQL** !

---

## 🌟 Fonctionnalités

- 🛡️ __Protection & Modération__ : Gestion avancée de la sécurité de votre serveur Discord.
- 🖼️ __Génération d'images__ : Génération de cartes de profils, cartes de bienvenue, via les librairies `canvas`, `canvacard` et `welcard`.
- 📊 __Base de données MySQL__ : Sauvegarde persistante des statistiques, configurations et données utilisateurs.
- 🎮 __Intégration Serveurs de Jeux__ : Prise en charge des statuts pour Minecraft et dizaines d'autres jeux multijoueurs.
- ☁️ __Panneau de contrôle pterodactyl__ : Actions en direct sur vos serveurs via Nodeactyl.

---

## 🚀 Déploiement via Docker / Portainer (Recommandé)

Afin d'assurer une stabilité maximale (spécialement en raison de la dépendance de Canvas aux paquets natifs de l'OS), il est vivement recommandé de déployer **SaikoBot** dans un conteneur !

> Le projet est pré-configuré avec un `Dockerfile` et un accès prêt à l'emploi.

### 1️⃣ Via Portainer (avec Github)

1. Rendez-vous sur votre panneau de gestion de conteneurs **Portainer**.
2. Allez dans la section **Stacks** et cliquez sur **Add stack**.
3. Dans la section *Build method*, choisissez **Repository**.
4. Déclarez le lien de votre GitHub actuel dans la ligne *Repository URL*.
5. (Optionnel) Si votre projet n'est pas public, activez *Repository authentication* (en générant un PAT sur GitHub).
6. **Important : Variables d'environnement**. En bas de la page de la stack, dans la sous-section *Environment variables*, ajoutez le nom et la valeur des variables qui se trouvaient dans votre ancien fichier `.env`. _(Voir liste des variables ci-dessous)_.
7. Appuyez sur **Deploy the stack**. Patientez quelques minutes pendant que Portainer installe les prérequis Linux, et voilà, votre bot est en ligne !

---

## ⚙️ Variables d'Environnement (.ENV)

Le bot ne fonctionnera pas s'il est incapable de se connecter à Discord ou à votre base MySQL.  
Voici la liste des variables d'environnement à obligatoirement renseigner dans Portainer (ou dans un `.env` pour le lancement local) :

| Variable | Description | Exemple / Valeur |
| :--- | :--- | :--- |
| `BOT_ID` | L'ID de votre bot Discord. | `10696865...` |
| `TOKEN` | Le token de votre bot discord. | `MTIzNDU2Nz...` |
| `GUILD_ID` | L'ID de votre serveur discord principal. | `76524426...` |
| `PTERODACTYL_API_KEY` | Clé API globale (Application) Pterodactyl. | `ptlc_oEizs...` |
| `PTERODACTYL_URL` | L'URL de votre panel Pterodactyl. | `https://panel.votresite.fr` |
| `PTERODACTYL_CLIENT_API_KEY` | Clé API client Pterodactyl. | `ptla_dpruA...` |
| `DB_HOST` | L'IP / URL de votre base de données locale ou distante. | `192.168.1.106` |
| `DB_PORT` | Le port de la base de données. | `3306` |
| `DB_USER` | Votre nom d'utilisateur MySQL. | `user` |
| `DB_PASSWORD` | Le mot de passe de cet utilisateur. | `password` |
| `DB_NAME` | Le nom précis de la base contenant les tables de votre bot. | `database` |
| `FABRIC_EXPORT` | L'adresse d'export de votre serveur Minecraft. | `192.168.1.105:51218` |

---

## 💻 Installation Manuelle / Locale (Pour les développeurs)

Si vous souhaitez modifier et lancer le code sur votre machine (Windows / Linux / MacOS) pour tester avant d'envoyer dans le docker de Portainer :

1. Entrez dans le dossier du bot et installez les librairies du projet :
   ```bash
   npm install
   ```
2. Renommez le fichier ou créez-en un qui doit s'appeler exactement `.env` pour y placer les variables demandées ci-dessus.
3. Démarrez le bot :
   ```bash
   node index.js
   ```

*(En cas d'erreur de compilation locale, assurez vous d'avoir installé les "C/C++ Build tools" pour Windows / Linux, car le module `canvas` nécessite d'être compilé lors du téléchargement).*

---
Créé avec 💙 par Alexis / Saiko
