const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addrole')
        .setDescription('Add a role to a member')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('The member to add the role to')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to add')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const member = interaction.options.getMember('member');
        const role = interaction.options.getRole('role');

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

        // Check if the member already has the role
        if (member.roles.cache.has(role.id)) {
            return interaction.reply({
                content: `${member.user.tag} already has the role ${role.name}!`,
                ephemeral: true
            });
        }

        try {
            // Add the role
            await member.roles.add(role);

            // Reply to the interaction
            await interaction.reply({
                content: `Successfully added role ${role.name} to ${member.user.tag}!`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error in addrole command:', error);
            await interaction.reply({
                content: 'There was an error while trying to add the role!',
                ephemeral: true
            });
        }
    },
}; 