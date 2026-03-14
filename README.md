# Docker Compose CLI Tool

> Utilitaire en ligne de commande permettant de créer et modifier automatiquement des fichiers `docker-compose.yml`.

[![Node.js](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Vue d'ensemble

**Docker Compose CLI Tool** est un script Node.js permettant d'automatiser la gestion des services dans un fichier `docker-compose.yml`.

Plutôt que d'éditer manuellement le YAML, cet outil permet de :

* Initialiser un fichier Docker Compose
* Ajouter des services
* Supprimer des services
* Vérifier automatiquement l'existence d'une image Docker sur Docker Hub
* Générer un historique des modifications

Cet outil est conçu comme un **CLI DevOps** simple pour manipuler les fichiers de configuration Docker de manière fiable.

---

## Stack technique

| Composant        | Technologie             |
| ---------------- | ----------------------- |
| **Langage**      | Node.js                 |
| **Parsing YAML** | js-yaml                 |
| **API externe**  | Docker Hub API          |
| **Logs**         | fs (filesystem Node.js) |

---

## Structure du projet

```
docker-compose-cli/
│
├── docker-compose-cli.js   # Script CLI principal
├── docker-compose.yml      # Exemple de fichier compose
├── package.json            # Dépendances Node.js
├── README.md               # Documentation
└── .gitignore              # Fichiers ignorés par Git
```

---

## Fonctionnalités

### Initialisation d'un fichier compose

Crée un fichier `docker-compose.yml` avec la structure minimale :

```yaml
services: {}
networks: {}
volumes: {}
```

Commande :

```bash
node docker-compose-cli.js docker-compose.yml init
```

---

### Ajout d'un service

Ajoute un service dans la section `services` du fichier.

Avant l'ajout, le script vérifie que l'image existe sur **Docker Hub**.

Exemple :

```bash
node docker-compose-cli.js docker-compose.yml add-service web nginx
```

Résultat :

```yaml
services:
  web:
    image: nginx
```

---

### Suppression d'un service

Supprime un service existant du fichier.

```bash
node docker-compose-cli.js docker-compose.yml remove-service web
```

---

### Historique des modifications

Chaque modification est enregistrée dans :

```
docker-cli.log
```

Format :

```
[2026-02-12] FICHIER: ./docker-compose.yml | ACTION: ADD | SERVICE: web | IMAGE: nginx
```

---

## Installation

### Prérequis

* **Node.js ≥ 18**

### Installation des dépendances

```bash
npm install
```

---

## Utilisation

Structure de la commande :

```bash
node docker-compose-cli.js <fichier.yml> <action> [paramètres]
```

### Actions disponibles

| Action           | Description                    |
| ---------------- | ------------------------------ |
| `init`           | Crée un fichier docker-compose |
| `add-service`    | Ajoute un service              |
| `remove-service` | Supprime un service            |

---

## Exemple complet

```bash
# Initialiser un fichier compose
node docker-compose-cli.js docker-compose.yml init

# Ajouter un service
node docker-compose-cli.js docker-compose.yml add-service web nginx

# Supprimer un service
node docker-compose-cli.js docker-compose.yml remove-service web
```

---

## Gestion des erreurs

Le script vérifie automatiquement :

* l'extension `.yml` ou `.yaml`
* l'existence de l'image Docker
* les erreurs de parsing YAML
* les services déjà existants

---

## Contribution

Projet réalisé dans le cadre d'un exercice en **JavaScript** visant à créer un outil CLI pour manipuler des fichiers Docker Compose.
