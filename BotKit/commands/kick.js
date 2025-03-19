const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('The member to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the kick')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        const member = interaction.options.getMember('member');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        // Check if the member is kickable
        if (!member.kickable) {
            return interaction.reply({
                content: 'I cannot kick this member!',
                ephemeral: true
            });
        }

        // Check if the user has a higher role than the target
        if (interaction.member.roles.highest.position <= member.roles.highest.position) {
            return interaction.reply({
                content: 'You cannot kick this member because they have a higher or equal role!',
                ephemeral: true
            });
        }

        try {
            // Send DM to the kicked user
            try {
                await member.send({
                    content: `You have been kicked from ${interaction.guild.name}\nReason: ${reason}`
                });
            } catch (error) {
                console.error('Could not send DM to user:', error);
            }

            // Kick the member
            await member.kick(`Kicked by ${interaction.user.tag}: ${reason}`);

            // Reply to the interaction
            await interaction.reply({
                content: `Kicked ${member.user.tag}\nReason: ${reason}`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error in kick command:', error);
            await interaction.reply({
                content: 'There was an error while trying to kick the member!',
                ephemeral: true
            });
        }
    },
}; 