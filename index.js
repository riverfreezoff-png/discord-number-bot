require(‘dotenv’).config();

const { Client, GatewayIntentBits, SlashCommandBuilder, AttachmentBuilder } = require(‘discord.js’);
const fs = require(‘fs’);
const path = require(‘path’);

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

// ─── Chargement des emojis personnalisés depuis le fichier JSON ───
const emojisConfig = JSON.parse(fs.readFileSync(’./emojis.json’, ‘utf8’));
const emojiFiles = emojisConfig.emojis;

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
],
});

// ─── Compteur global (partagé entre tous les membres) ───
let nombreAttendu = 1;

// Convertit un nombre en tableau de fichiers d’images
function getEmojiFiles(nombre) {
const chiffres = String(nombre).split(’’);
const files = [];

chiffres.forEach((chiffre, index) => {
const fileName = emojiFiles[chiffre];
const filePath = path.join(__dirname, ‘emojis’, fileName);

```
if (fs.existsSync(filePath)) {
  files.push(
    new AttachmentBuilder(filePath, { name: `${index}_${fileName}` })
  );
}
```

});

return files;
}

// ─── Enregistrement de la commande slash ───
const commands = [
new SlashCommandBuilder()
.setName(‘nombre’)
.setDescription(‘Envoie le nombre suivant dans la suite’)
.addIntegerOption((option) =>
option
.setName(‘nombre’)
.setDescription(‘Le nombre que tu veux envoyer’)
.setRequired(true)
.setMinValue(0)
),
];

// ─── Quand le bot est prêt ───
client.once(‘ready’, async () => {
console.log(`✅ Bot connecté en tant que ${client.user.tag}`);

// Enregistre les commandes slash sur tous les serveurs
try {
await client.application.commands.set(commands);
console.log(‘✅ Commandes slash enregistrées’);
} catch (err) {
console.error(‘❌ Erreur lors de l'enregistrement des commandes :’, err);
}
});

// ─── Gestion des interactions (commandes slash) ───
client.on(‘interactionCreate’, async (interaction) => {
if (!interaction.isChatInputCommand()) return;
if (interaction.commandName !== ‘nombre’) return;

// ─── Vérification du salon ───
if (interaction.channelId !== CHANNEL_ID) {
await interaction.reply({
content: `❌ Cette commande ne peut être utilisée que dans le salon <#${CHANNEL_ID}> !`,
ephemeral: true,
});
return;
}

const nombreEnvoyé = interaction.options.getInteger(‘nombre’);

// ✅ Le nombre est correct → on avance le compteur
if (nombreEnvoyé === nombreAttendu) {
const emojiImages = getEmojiFiles(nombreEnvoyé);
nombreAttendu++;

```
await interaction.reply({
  content: `✅ **${nombreEnvoyé}**`,
  files: emojiImages,
});

console.log(`✅ ${interaction.user.tag} a envoyé ${nombreEnvoyé} → suite continue (prochain : ${nombreAttendu})`);
```

}
// ❌ Le nombre est incorrect → on recommence à 1
else {
nombreAttendu = 1; // Reset

```
await interaction.reply({
  content: `❌ Le nombre attendu était **${nombreAttendu - 1}** ! Le compteur recommence à **1**.`,
  ephemeral: true,
});

console.log(`❌ ${interaction.user.tag} a envoyé ${nombreEnvoyé} (attendu : ${nombreAttendu - 1}) → reset`);
```

}
});

// ─── Démarrage du bot ───
client.login(TOKEN);