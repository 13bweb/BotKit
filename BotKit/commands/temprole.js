const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Database = require('../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('temprole')
        .setDescription('Temporarily assign a role to a member')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('The member to give the role to')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to temporarily assign')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Duration (e.g., 1h, 30m, 1d)')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const member = interaction.options.getMember('member');
        const role = interaction.options.getRole('role');
        const durationStr = interaction.options.getString('duration');

        // Check if the bot can manage roles
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({
                content: 'I do not have permission to manage roles!',
                ephemeral: true
            });
        }

        // Check if the role is manageable
        if (!role.editable) {
            return interaction.reply({
                content: 'I cannot manage this role!',
                ephemeral: true
            });
        }

        // Check if the user has a higher role than the target
        if (interaction.member.roles.highest.position <= member.roles.highest.position) {
            return interaction.reply({
                content: 'You cannot modify roles for this member because they have a higher or equal role!',
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
            // Add the role
            await member.roles.add(role);

            // Store temporary role in database
            Database.addTempRole(member.id, interaction.guild.id, role.id, duration, interaction.user.id);

            // Set up timeout to remove role
            setTimeout(async () => {
                try {
                    if (member.roles.cache.has(role.id)) {
                        await member.roles.remove(role);
                        Database.removeTempRole(member.id, interaction.guild.id, role.id);
                        await member.send(`Your temporary role ${role.name} in ${interaction.guild.name} has expired.`);
                    }
                } catch (error) {
                    console.error('Error removing temporary role:', error);
                }
            }, duration);

            // Reply to the interaction
            await interaction.reply({
                content: `Successfully assigned role ${role.name} to ${member.user.tag} for ${durationStr}!`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error in temprole command:', error);
            await interaction.reply({
                content: 'There was an error while trying to assign the temporary role!',
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