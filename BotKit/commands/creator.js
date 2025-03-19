const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { COLORS } = require('../utils/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('creator')
        .setDescription('Information about the bot creator'),

    async execute(interaction) {
        const creatorEmbed = new EmbedBuilder()
            .setTitle('🌟 Bot Creator')
            .setDescription('This bot was created by **13bweb**')
            .setColor(COLORS.HIGHLIGHT)
            .addFields(
                { name: 'GitHub', value: '[13bweb](https://github.com/13bweb)', inline: true },
                { name: 'Bot Version', value: '1.0.0', inline: true }
            )
            .setThumbnail('https://github.com/13bweb.png')
            .setTimestamp()
            .setFooter({ text: 'BotKit by 13bweb' });

        await interaction.reply({ embeds: [creatorEmbed] });
    },
}; 