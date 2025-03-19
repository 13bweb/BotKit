const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Database = require('../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a member for a specified duration')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('The member to mute')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Duration (e.g., 1h, 30m, 1d)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the mute')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const member = interaction.options.getMember('member');
        const durationStr = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        // Check if the member is moderatable
        if (!member.moderatable) {
            return interaction.reply({
                content: 'I cannot mute this member!',
                ephemeral: true
            });
        }

        // Check if the user has a higher role than the target
        if (interaction.member.roles.highest.position <= member.roles.highest.position) {
            return interaction.reply({
                content: 'You cannot mute this member because they have a higher or equal role!',
                ephemeral: true
            });
        }

        // Parse duration
        const duration = parseDuration(durationStr);
        if (!duration) {
            return interaction.reply({
                content: 'Invalid duration format! Use format like: 1h, 30m, 1d',
                ephemeral: true
            });
        }

        try {
            // Add mute to database
            Database.addMute(member.id, interaction.guild.id, duration, reason, interaction.user.id);

            // Send DM to the muted user
            try {
                await member.send({
                    content: `You have been muted in ${interaction.guild.name}\nDuration: ${durationStr}\nReason: ${reason}`
                });
            } catch (error) {
                console.error('Could not send DM to user:', error);
            }

            // Timeout the member
            await member.timeout(duration, `Muted by ${interaction.user.tag}: ${reason}`);

            // Set up timeout to remove mute
            setTimeout(async () => {
                try {
                    await member.timeout(null);
                    Database.removeMute(member.id, interaction.guild.id);
                    await member.send(`Your mute in ${interaction.guild.name} has expired.`);
                } catch (error) {
                    console.error('Error removing timeout:', error);
                }
            }, duration);

            // Reply to the interaction
            await interaction.reply({
                content: `Muted ${member.user.tag}\nDuration: ${durationStr}\nReason: ${reason}`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error in mute command:', error);
            await interaction.reply({
                content: 'There was an error while trying to mute the member!',
                ephemeral: true
            });
        }
    },
};

function parseDuration(durationStr) {
    const match = durationStr.match(/^(\d+)([smhd])$/);
    if (!match) return null;

    const [, amount, unit] = match;
    const multipliers = {
        's': 1000,
        'm': 60 * 1000,
        'h': 60 * 60 * 1000,
        'd': 24 * 60 * 60 * 1000
    };

    return parseInt(amount) * multipliers[unit];
} 