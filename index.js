require('dotenv').config();

const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let nombreAttendu = 1;
const emojiChiffres = {
  '0': '0️⃣',
  '1': '1️⃣',
  '2': '2️⃣',
  '3': '3️⃣',
  '4': '4️⃣',
  '5': '5️⃣',
  '6': '6️⃣',
  '7': '7️⃣',
  '8': '8️⃣',
  '9': '9️⃣',
};

function nombreEnEmoji(nombre) {
  return String(nombre)
    .split('')
    .map((chiffre) => emojiChiffres[chiffre])
    .join('');
}

const commands = [
  new SlashCommandBuilder()
    .setName('nombre')
    .setDescription('Envoie le nombre suivant dans la suite')
    .addIntegerOption((option) =>
      option
        .setName('nombre')
        .setDescription('Le nombre que tu veux envoyer')
        .setRequired(true)
        .setMinValue(0),
    ),
];

client.once('ready', async () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);

  try {
    await client.application.commands.set(commands);
    console.log('✅ Commandes slash enregistrées');
  } catch (err) {
    console.error('❌ Erreur lors de l\'enregistrement des commandes :', err);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'nombre') return;

  if (interaction.channelId !== CHANNEL_ID) {
    await interaction.reply({
      content: `❌ Cette commande ne peut être utilisée que dans le salon <#${CHANNEL_ID}> !`,
      ephemeral: true,
    });
    return;
  }

  const nombreEnvoyé = interaction.options.getInteger('nombre');

  if (nombreEnvoyé === nombreAttendu) {
    const emojiMessage = nombreEnEmoji(nombreEnvoyé);
    nombreAttendu++;
    await interaction.reply({
      content: `${emojiMessage}`,
    });

    console.log(`✅ ${interaction.user.tag} a envoyé ${nombreEnvoyé} → suite continue (prochain : ${nombreAttendu})`);
  } else {
    const emojiAttendu = nombreEnEmoji(nombreAttendu);
    nombreAttendu = 1;
    await interaction.reply({
      content: `❌ Le nombre attendu était ${emojiAttendu} ! Le compteur recommence à ${nombreEnEmoji(1)}.`,
    });

    console.log(`❌ ${interaction.user.tag} a envoyé ${nombreEnvoyé} (attendu : ${nombreAttendu - 1}) → reset`);
  }
});

client.login(TOKEN);