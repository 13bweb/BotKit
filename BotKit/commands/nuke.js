const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nuke')
        .setDescription('Delete and recreate the current channel with the same settings')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const channel = interaction.channel;

        // Defer the reply since this operation might take some time
        await interaction.deferReply({ ephemeral: true });

        try {
            // Store channel settings
            const channelSettings = {
                name: channel.name,
                type: channel.type,
                topic: channel.topic,
                nsfw: channel.nsfw,
                parentId: channel.parentId,
                permissionOverwrites: channel.permissionOverwrites.cache,
                rateLimitPerUser: channel.rateLimitPerUser,
                position: channel.position
            };

            // Delete the channel
            await channel.delete();

            // Create a new channel with the same settings
            const newChannel = await interaction.guild.channels.create({
                name: channelSettings.name,
                type: channelSettings.type,
                topic: channelSettings.topic,
                nsfw: channelSettings.nsfw,
                parent: channelSettings.parentId,
                permissionOverwrites: channelSettings.permissionOverwrites,
                rateLimitPerUser: channelSettings.rateLimitPerUser,
                position: channelSettings.position
            });

            // Send confirmation message
            await newChannel.send({
                content: 'Channel has been nuked and recreated! 🧹'
            });

            // Edit the deferred reply
            await interaction.editReply({
                content: `Channel has been successfully nuked and recreated!`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Error in nuke command:', error);
            await interaction.editReply({
                content: 'There was an error while trying to nuke the channel!',
                ephemeral: true
            });
        }
    },
}; 