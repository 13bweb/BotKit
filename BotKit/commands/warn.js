const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Database = require('../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a member')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('The member to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the warning')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const member = interaction.options.getMember('member');
        const reason = interaction.options.getString('reason');

        // Check if the member is warnable
        if (!member.moderatable) {
            return interaction.reply({
                content: 'I cannot warn this member!',
                ephemeral: true
            });
        }

        // Add the warning to the database
        const warnCount = Database.addWarn(
            member.id,
            interaction.guild.id,
            reason,
            interaction.user.id
        );

        // Send DM to the warned user
        try {
            await member.send({
                content: `You have been warned in ${interaction.guild.name}\nReason: ${reason}\nWarning #${warnCount}`
            });
        } catch (error) {
            console.error('Could not send DM to user:', error);
        }

        // Reply to the interaction
        await interaction.reply({
            content: `Warned ${member.user.tag}\nReason: ${reason}\nWarning #${warnCount}`,
            ephemeral: true
        });
    },
}; 