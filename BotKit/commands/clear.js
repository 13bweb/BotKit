const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear messages from the channel')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to clear (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .addUserOption(option =>
            option.setName('member')
                .setDescription('Clear messages from a specific member')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const member = interaction.options.getMember('member');

        // Defer the reply since this operation might take some time
        await interaction.deferReply({ ephemeral: true });

        try {
            let messages;
            if (member) {
                // Fetch messages and filter by member
                messages = await interaction.channel.messages.fetch({ limit: 100 });
                messages = messages.filter(msg => msg.author.id === member.id);
                messages = messages.first(amount);
            } else {
                // Fetch messages normally
                messages = await interaction.channel.messages.fetch({ limit: amount });
            }

            // Delete messages
            await interaction.channel.bulkDelete(messages, true);

            // Edit the deferred reply
            await interaction.editReply({
                content: `Successfully deleted ${messages.size} messages${member ? ` from ${member.user.tag}` : ''}!`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error in clear command:', error);
            await interaction.editReply({
                content: 'There was an error while trying to clear messages!',
                ephemeral: true
            });
        }
    },
}; 