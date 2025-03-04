# 📌 Percepteurs Bot - Installation et Configuration

Projet de gestion des percepteurs avec un bot Discord connecté à une base de données MySQL.

## 🔹 1. Prérequis
Avant de commencer, assure-toi d’avoir installé :
- **[Node.js](https://nodejs.org/) (v18 ou plus)**
- **[MySQL](https://dev.mysql.com/downloads/)**
- **[WAMP](https://wampserver.aviatechno.net/) ou [MAMP](https://www.mamp.info/en/)** pour un serveur local avec phpMyAdmin.
- **Un éditeur de code (VS Code recommandé)**
- **Git (optionnel, si tu clones le projet)**

---

## 🔹 2. Cloner le projet
Si tu utilises **Git**, exécute cette commande :
```bash
git clone https://github.com/flotttt/PercepteursDofus.git
cd PercepteursDofus
```
Sinon, télécharge simplement les fichiers et place-les dans un dossier.

---



## 🔹 4. Configurer l’environnement
Crée un fichier **`.env`** à la racine du projet et ajoute :
```ini
# ⚙️ Config Discord Bot
DISCORD_BOT_TOKEN=TON_BOT_TOKEN
DISCORD_GUILD_ID=TON_SERVEUR_ID
DISCORD_CHANNEL_ID=TON_CHANNEL_ID

# ⚙️ Config Base de Données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mot_de_passe
DB_NAME=percepteurs
DB_PORT=3306 # Change si nécessaire (8889 pour MAMP sur Mac)

# ⚙️ Port Backend
PORT=3001
```
🔹 **Remplace les valeurs** (`TON_BOT_TOKEN`, `TON_SERVEUR_ID`, etc.) par celles de ton projet.

---

## 🔹 5. Configurer MySQL avec WAMP/MAMP

### 📌 5.1. Installer WAMP ou MAMP
Si MySQL n'est pas installé, utilise **WAMP (Windows)** ou **MAMP (Mac)** pour gérer ta base de données facilement.
- **Télécharge et installe WAMP** : [WAMP Server](https://wampserver.aviatechno.net/)
- **Télécharge et installe MAMP** : [MAMP](https://www.mamp.info/en/)

Après installation, démarre **phpMyAdmin** depuis WAMP/MAMP et crée la base de données.

### 📌 5.2. Créer la base MySQL
Lance MySQL et exécute :
```sql
CREATE DATABASE percepteurs;
USE percepteurs;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL
);

CREATE TABLE percepteurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    zone_pose VARCHAR(255),
    latitude FLOAT,
    longitude FLOAT,
    date_pose DATETIME,
    date_retrait DATETIME NULL,
    gain INT DEFAULT 0,
    attaque BOOLEAN DEFAULT 0,
    heure_attaque TIME NULL,
    sacoche_pods BOOLEAN DEFAULT 0,
    coffre BOOLEAN DEFAULT 0,
    popo_price INT DEFAULT 0,
    FOREIGN KEY (id_user) REFERENCES users(id)
);
```
🔹 **Si tu as déjà une base, saute cette étape.**

---

## 🔹 6. Installer et lancer le frontend
Si le projet contient un frontend (React, Next.js, Vue, etc.), installe ses dépendances et lance-le :

```bash
cd frontend  # Va dans le dossier du front-end
npm install  # Installe les dépendances
npm run dev  # Lance le serveur en mode développement
```
📢 Par défaut, le frontend tourne sur **http://localhost:3000/**

---

## 🔹 7. Lancer le backend
Dans un terminal, exécute :
```bash
cd backend 
npm install  # Installe les dépendances
node server.js
```
📢 Si tout fonctionne, tu devrais voir **"Serveur lancé sur le port 3001"**.

Vérifie que l'API fonctionne avec :
```bash
curl http://localhost:3001/percepteurs
```
Si tu reçois une **réponse JSON**, c'est bon !

---

## 🔹 8. Lancer le bot Discord
Dans un **nouveau terminal**, exécute :
```bash
node bot.js
```
📢 Tu devrais voir **"Bot connecté en tant que Percepteurs#xxxx"**.

---

## 🔹 9. Tester le bot sur Discord
Une fois le bot en ligne, teste les commandes :
- `/ajouterperco`
- `/stats`
- `/listerperco`
- **Cliquer sur "Retirer" pour tester le retrait**

---

## 🎯 Résumé des commandes utiles
📌 **Installation**
```bash
npm install
```
📌 **Lancer le serveur backend**
```bash
node server.js
```
📌 **Lancer le frontend**
```bash
npm run dev
```
📌 **Lancer le bot Discord**
```bash
node bot.js
```
📌 **Vérifier si MySQL fonctionne**
```bash
mysql -u root -p
```
📌 **Vérifier les logs du bot**
```bash
tail -f logs/bot.log  # (Si tu as un fichier de logs)
```

---

🚀 **Et voilà ! Tu es prêt à gérer tes percepteurs depuis Discord et l'interface web !**  
🔥 **Si tu as un problème, vérifie les logs du backend, du bot et du frontend.**