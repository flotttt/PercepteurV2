require("dotenv").config();
const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const fetch = require("node-fetch");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

// ➤ Connexion du bot
client.login(process.env.DISCORD_BOT_TOKEN)
    .then(() => console.log("✅ Connexion au bot réussie !"))
    .catch((err) => {
        console.error("❌ Erreur lors de la connexion :", err);
        process.exit(1);
    });

// ➤ Bot prêt
client.once("ready", async () => {
    console.log(`✅ Bot connecté en tant que ${client.user.tag}`);

    const guildId = process.env.DISCORD_GUILD_ID;
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
        console.error("❌ Impossible de récupérer le serveur. Vérifie l'ID !");
        return;
    }

    // Enregistrer les commandes
    await guild.commands.set([
        new SlashCommandBuilder()
            .setName("ajouterperco")
            .setDescription("➕ Ouvre un formulaire pour ajouter un percepteur"),

        new SlashCommandBuilder()
            .setName("stats")
            .setDescription("📊 Affiche les statistiques des percepteurs"),

        new SlashCommandBuilder()
            .setName("listerperco")
            .setDescription("📋 Liste uniquement les percepteurs en cours (non retirés)")
    ]);

    console.log("✅ Commandes enregistrées : /ajouterperco, /stats, /listerperco");
});

// ➤ InteractionCreate
client.on("interactionCreate", async (interaction) => {
    // -------------------------------------------------------------------
    // 1) Commande /ajouterperco (ouvre le Modal)
    // -------------------------------------------------------------------
    if (interaction.isCommand() && interaction.commandName === "ajouterperco") {
        // Crée le Modal
        const modal = new ModalBuilder()
            .setCustomId("ajouter_perco")
            .setTitle("➕ Ajouter un Percepteur");

        // Champs
        const zonePoseInput = new TextInputBuilder()
            .setCustomId("zone_pose")
            .setLabel("📍 Nom de la zone")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const latitudeInput = new TextInputBuilder()
            .setCustomId("latitude")
            .setLabel("🌍 Latitude")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const longitudeInput = new TextInputBuilder()
            .setCustomId("longitude")
            .setLabel("🌍 Longitude")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const popoPriceInput = new TextInputBuilder()
            .setCustomId("popo_price")
            .setLabel("🧪 Prix de la Popo")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        // Ajoute les champs dans le modal
        modal.addComponents(
            new ActionRowBuilder().addComponents(zonePoseInput),
            new ActionRowBuilder().addComponents(latitudeInput),
            new ActionRowBuilder().addComponents(longitudeInput),
            new ActionRowBuilder().addComponents(popoPriceInput)
        );

        await interaction.showModal(modal);
    }

        // -------------------------------------------------------------------
        // 2) Soumission du Modal "ajouter_perco"
    // -------------------------------------------------------------------
    else if (interaction.isModalSubmit() && interaction.customId === "ajouter_perco") {
        const zone_pose = interaction.fields.getTextInputValue("zone_pose");
        const latitude = parseFloat(interaction.fields.getTextInputValue("latitude"));
        const longitude = parseFloat(interaction.fields.getTextInputValue("longitude"));
        const popo_price = parseInt(interaction.fields.getTextInputValue("popo_price"));

        // Objet percepteur
        const percepteur = {
            id_user: 1, // ou un ID réel si tu gères l'auth autrement
            zone_pose,
            latitude,
            longitude,
            date_pose: new Date().toISOString().slice(0, 19).replace("T", " "),
            gain: 0,
            attaque: 0,
            heure_attaque: null,
            sacoche_pods: 0,
            coffre: 0,
            popo_price
        };

        try {
            // Appel POST vers l'API
            const response = await fetch("http://localhost:3001/percepteurs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(percepteur),
            });

            if (!response.ok) throw new Error("Erreur d'ajout du percepteur en base");

            await interaction.reply({
                content: `✅ **Percepteur ajouté en zone ${zone_pose} !**`,
                ephemeral: true
            });
        } catch (error) {
            console.error("❌ Erreur lors de l'ajout du percepteur :", error);
            await interaction.reply({
                content: "❌ Une erreur est survenue lors de l'ajout.",
                ephemeral: true
            });
        }
    }

        // -------------------------------------------------------------------
        // 3) Commande /stats
    // -------------------------------------------------------------------
    else if (interaction.isCommand() && interaction.commandName === "stats") {
        try {
            // Récupère la liste
            const response = await fetch("http://localhost:3001/percepteurs");
            if (!response.ok) throw new Error("Erreur lors de la récupération des percepteurs");
            const percepteurs = await response.json();

            const percepteursPoses = percepteurs.length;
            const percepteursRetires = percepteurs.filter(p => p.date_retrait && !p.attaque).length;
            const percepteursAttaques = percepteurs.filter(p => p.attaque).length;

            const totalGains = percepteurs
                .filter(p => p.date_retrait && !p.attaque)
                .reduce((acc, p) => acc + p.gain, 0);

            let pertesItems = 0;
            percepteurs
                .filter(p => p.date_retrait && p.attaque)
                .forEach(p => {
                    if (p.sacoche_pods === 1) pertesItems += 180000;
                    if (p.coffre === 1) pertesItems += 150000;
                });

            const totalPopo = percepteurs.reduce((acc, p) => acc + (p.popo_price || 0), 0);
            const totalPertes = pertesItems + totalPopo;
            const gainNet = totalGains - totalPertes;
            const tauxReussite = percepteursPoses > 0
                ? ((percepteursRetires / percepteursPoses) * 100).toFixed(2)
                : 0;

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle("📊 **Statistiques des Percepteurs**")
                .addFields(
                    { name: "📍 **Percepteurs posés**", value: `\`${percepteursPoses}\``, inline: true },
                    { name: "🔄 **Retirés**", value: `\`${percepteursRetires}\``, inline: true },
                    { name: "⚠️ **Attaqués**", value: `\`${percepteursAttaques}\``, inline: true },
                    { name: "💰 **Total des gains**", value: `\`${totalGains.toLocaleString()} Kamas\``, inline: true },
                    { name: "❌ **Pertes (Objets & Popo)**", value: `\`${totalPertes.toLocaleString()} Kamas\``, inline: true },
                    { name: "💵 **Gain Net**", value: `\`${gainNet.toLocaleString()} Kamas\``, inline: true },
                    { name: "🎯 **Taux de réussite**", value: `\`${tauxReussite}%\``, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("❌ Erreur lors de la récupération :", error);
            await interaction.reply({
                content: "⚠️ Impossible de récupérer les statistiques.",
                ephemeral: true
            });
        }
    }

        // -------------------------------------------------------------------
        // 4) Commande /listerperco (liste seulement ceux qui ne sont pas retirés)
    // -------------------------------------------------------------------
    else if (interaction.isCommand() && interaction.commandName === "listerperco") {
        try {
            // ✅ Informe Discord qu'on va répondre plus tard pour éviter l'expiration
            await interaction.deferReply({ ephemeral: true });

            // 🔹 On récupère les percepteurs actifs
            const response = await fetch("http://localhost:3001/percepteurs/actifs");
            if (!response.ok) throw new Error("Erreur lors de la récupération des percepteurs actifs");
            const percepteurs = await response.json();

            if (percepteurs.length === 0) {
                return await interaction.editReply({ content: "❌ Aucun percepteur en cours." });
            }

            const limitedList = percepteurs.slice(0, 25);

            let description = "";
            for (const p of limitedList) {
                description += `🔹 **Percepteur #${p.id}**\n`;
                description += `📍 **Zone** : ${p.zone_pose}\n`;
                description += `🌍 **Coordonnées** : \`${p.latitude}, ${p.longitude}\`\n`;
                description += `🛠️ **Objets** : ${p.sacoche_pods ? "🎒 Sacoche Pods" : ""} ${p.coffre ? "📦 Coffre" : "❌ Aucun"}\n`;
                description += `🧪 **Prix de la Popo** : \`${p.popo_price.toLocaleString()} Kamas\`\n`;
                description += `⚠️ **Attaqué** : ${p.attaque ? "🚨 Oui" : "✅ Non"}\n`;
                description += `━━━━━━━━━━━━━━\n`;
            }

            const embed = new EmbedBuilder()
                .setTitle("📋 **Percepteurs en cours**")
                .setDescription(description)
                .setTimestamp();

            const actionRows = [];
            let currentRow = new ActionRowBuilder();

            for (let i = 0; i < limitedList.length; i++) {
                const p = limitedList[i];
                const button = new ButtonBuilder()
                    .setCustomId(`retirer_perco_${p.id}`)
                    .setLabel(`❌ Retirer #${p.id}`)
                    .setStyle(ButtonStyle.Danger);

                currentRow.addComponents(button);
                if ((i + 1) % 5 === 0) {
                    actionRows.push(currentRow);
                    currentRow = new ActionRowBuilder();
                }
            }
            if (currentRow.components.length > 0) {
                actionRows.push(currentRow);
            }

            // ✅ Utilise `editReply()` après `deferReply()`
            await interaction.editReply({
                embeds: [embed],
                components: actionRows,
            });

        } catch (error) {
            console.error("Erreur /listerperco :", error);
            await interaction.editReply({
                content: "❌ Impossible de lister les percepteurs en cours.",
            });
        }
    }

        // -------------------------------------------------------------------
        // 5) Bouton "Retirer #X"
    // -------------------------------------------------------------------
    else if (interaction.isButton()) {
        const customId = interaction.customId;
        if (customId.startsWith("retirer_perco_")) {
            const percepteurId = customId.replace("retirer_perco_", "");

            try {
                // ✅ Informe Discord qu'on va répondre plus tard
                await interaction.deferReply({ ephemeral: true });

                const gain = 500000;

                const response = await fetch(`http://localhost:3001/percepteurs/${percepteurId}/retrait`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ gain })
                });

                if (!response.ok) {
                    throw new Error(`Impossible de retirer le percepteur #${percepteurId}`);
                }

                const data = await response.json();

                const embed = new EmbedBuilder()
                    .setColor(0xff3300)
                    .setTitle("🗑️ **Percepteur retiré !**")
                    .setDescription(`Le percepteur a été retiré avec succès.`)
                    .addFields(
                        { name: "📍 **Zone**", value: `\`${data.zone_pose}\``, inline: true },
                        { name: "🌍 **Coordonnées**", value: `\`${data.latitude}, ${data.longitude}\``, inline: true },
                        { name: "💵 **Gain Réalisé**", value: `\`${data.gainFinal.toLocaleString()} Kamas\``, inline: true }
                    )
                    .setTimestamp();

                // ✅ Utilise `editReply()` pour répondre après `deferReply()`
                await interaction.editReply({ embeds: [embed] });

            } catch (error) {
                console.error("Erreur lors du retrait :", error);
                await interaction.editReply({
                    content: "❌ Erreur lors du retrait du percepteur.",
                });
            }
        }
    }
});

// -------------------------------------------------------------------
// 6) Fonction utilitaire : sendDiscordNotification
// -------------------------------------------------------------------
exports.sendDiscordNotification = async (notifData) => {
    try {
        const channelId = process.env.DISCORD_CHANNEL_ID;
        const channel = await client.channels.fetch(channelId);
        if (!channel) return;

        // S'il s'agit d'un simple string
        if (typeof notifData === "string") {
            await channel.send(notifData);
            return;
        }

        // Sinon, on construit un Embed
        const embed = new EmbedBuilder()
            .setTitle(notifData.title || "Notification")
            .setDescription(notifData.description || "")
            .setColor(notifData.color || 0xffffff)
            .setTimestamp();

        if (Array.isArray(notifData.fields)) {
            embed.addFields(notifData.fields);
        }

        await channel.send({ embeds: [embed] });
    } catch (error) {
        console.error("❌ Erreur lors de l'envoi Discord :", error);
    }
};