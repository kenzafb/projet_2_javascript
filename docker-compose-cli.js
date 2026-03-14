#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// ─── Helpers ────────────────────────────────────────────────────────────────

function validateYmlExtension(filePath) {
  const ext = path.extname(filePath);
  if (ext !== '.yml' && ext !== '.yaml') {
    console.error(`❌ Erreur : le fichier doit avoir l'extension .yml ou .yaml`);
    process.exit(1);
  }
}

function loadOrInit(filePath) {
  if (!fs.existsSync(filePath)) {
    return { services: {}, networks: {}, volumes: {} };
  }
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.load(content) || { services: {}, networks: {}, volumes: {} };
  } catch (err) {
    console.error(`❌ Erreur de parsing YAML : ${err.message}`);
    process.exit(1);
  }
}

function saveFile(filePath, data) {
  const yamlStr = yaml.dump(data, { noRefs: true });
  fs.writeFileSync(filePath, yamlStr, 'utf8');
}

function writeLog(filePath, action, serviceName, image = null) {
  const date = new Date().toISOString().split('T')[0];
  let line = `[${date}] FICHIER: ${filePath} | ACTION: ${action} | SERVICE: ${serviceName}`;
  if (image) line += ` | IMAGE: ${image}`;
  line += '\n';
  fs.appendFileSync('docker-cli.log', line, 'utf8');
}

// ─── Image verification via Docker Hub API ───────────────────────────────────

async function imageExistsOnDockerHub(image) {
  // Support image:tag format
  const [name, tag = 'latest'] = image.split(':');
  const url = `https://hub.docker.com/v2/repositories/library/${name}/tags/${tag}`;
  try {
    const res = await fetch(url);
    if (res.status === 404) return false;
    if (!res.ok) throw new Error(`Réponse inattendue : ${res.status}`);
    return true;
  } catch (err) {
    console.error(`❌ Erreur réseau lors de la vérification de l'image : ${err.message}`);
    process.exit(1);
  }
}

// ─── Actions ─────────────────────────────────────────────────────────────────

function actionInit(filePath) {
  if (fs.existsSync(filePath)) {
    console.error(`❌ Erreur : le fichier "${filePath}" existe déjà. Supprimez-le manuellement si vous souhaitez le réinitialiser.`);
    process.exit(1);
  }
  const data = { services: {}, networks: {}, volumes: {} };
  saveFile(filePath, data);
  console.log(`✅ Fichier "${filePath}" initialisé avec succès.`);
}

async function actionAddService(filePath, serviceName, image) {
  if (!serviceName || !image) {
    console.error('❌ Usage : node docker-compose-cli.js <fichier> add-service <nom> <image>');
    process.exit(1);
  }

  console.log(`🔍 Vérification de l'image "${image}" sur Docker Hub...`);
  const exists = await imageExistsOnDockerHub(image);
  if (!exists) {
    console.error(`❌ L'image "${image}" est introuvable sur Docker Hub. Service non ajouté.`);
    process.exit(1);
  }

  const data = loadOrInit(filePath);
  if (!data.services) data.services = {};

  if (data.services[serviceName]) {
    console.error(`❌ Erreur : le service "${serviceName}" existe déjà dans le fichier.`);
    process.exit(1);
  }

  data.services[serviceName] = { image };
  saveFile(filePath, data);
  writeLog(filePath, 'ADD', serviceName, image);
  console.log(`✅ Service "${serviceName}" ajouté avec l'image "${image}".`);
}

function actionRemoveService(filePath, serviceName) {
  if (!serviceName) {
    console.error('❌ Usage : node docker-compose-cli.js <fichier> remove-service <nom>');
    process.exit(1);
  }

  const data = loadOrInit(filePath);
  if (!data.services) data.services = {};

  if (!data.services[serviceName]) {
    console.error(`❌ Erreur : le service "${serviceName}" n'existe pas dans le fichier.`);
    process.exit(1);
  }

  delete data.services[serviceName];
  saveFile(filePath, data);
  writeLog(filePath, 'REMOVE', serviceName);
  console.log(`✅ Service "${serviceName}" supprimé avec succès.`);
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main() {
  const [,, filePath, action, ...params] = process.argv;

  if (!filePath || !action) {
    console.error('❌ Usage : node docker-compose-cli.js <fichier> <action> [paramètres...]');
    process.exit(1);
  }

  validateYmlExtension(filePath);

  switch (action) {
    case 'init':
      actionInit(filePath);
      break;
    case 'add-service':
      await actionAddService(filePath, params[0], params[1]);
      break;
    case 'remove-service':
      actionRemoveService(filePath, params[0]);
      break;
    default:
      console.error(`❌ Action inconnue : "${action}". Actions disponibles : init, add-service, remove-service`);
      process.exit(1);
  }
}

main().catch(err => {
  console.error(`❌ Erreur inattendue : ${err.message}`);
  process.exit(1);
});
