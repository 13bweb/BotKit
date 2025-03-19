const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Database = require('../utils/database');
const { COLORS } = require('../utils/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('The member to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the ban')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const member = interaction.options.getMember('member');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        // Check if the member is bannable
        if (!member.bannable) {
            return interaction.reply({
                content: 'I cannot ban this member!',
                ephemeral: true
            });
        }

        // Check if the user has a higher role than the target
        if (interaction.member.roles.highest.position <= member.roles.highest.position) {
            return interaction.reply({
                content: 'You cannot ban this member because they have a higher or equal role!',
                ephemeral: true
            });
        }

        try {
            // Add ban to database
            Database.addBan(member.id, interaction.guild.id, reason, interaction.user.id);

            // Send DM to the banned user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setTitle(`Vous avez été banni de ${interaction.guild.name}`)
                    .setDescription(`**Raison:** ${reason}`)
                    .setColor(COLORS.ACCENT)
                    .setTimestamp();

                await member.send({ embeds: [dmEmbed] });
            } catch (error) {
                console.error('Could not send DM to user:', error);
            }

            // Ban the member
            await member.ban({ reason: `Banned by ${interaction.user.tag}: ${reason}` });

            // Reply to the interaction
            const banEmbed = new EmbedBuilder()
                .setTitle('🔨 Membre Banni')
                .setDescription(`**Membre:** ${member.user.tag}\n**Raison:** ${reason}`)
                .setColor(COLORS.ACCENT)
                .setTimestamp()
                .setFooter({ text: `Banni par ${interaction.user.tag}` });

            await interaction.reply({ embeds: [banEmbed], ephemeral: true });
        } catch (error) {
            console.error('Error in ban command:', error);
            await interaction.reply({
                content: 'There was an error while trying to ban the member!',
                ephemeral: true
            });
        }
    },
}; 