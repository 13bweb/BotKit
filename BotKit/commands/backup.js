const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Database = require('../utils/database');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('backup')
        .setDescription('Manage server backups')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new backup')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type of backup to create')
                        .setRequired(true)
                        .addChoices(
                            { name: 'All', value: 'all' },
                            { name: 'Roles', value: 'roles' },
                            { name: 'Channels', value: 'channels' },
                            { name: 'Emojis', value: 'emojis' },
                            { name: 'Bans', value: 'bans' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all backups'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('load')
                .setDescription('Load a backup')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('Backup ID to load')
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'create':
                await this.createBackup(interaction);
                break;
            case 'list':
                await this.listBackups(interaction);
                break;
            case 'load':
                await this.loadBackup(interaction);
                break;
        }
    },

    async createBackup(interaction) {
        const type = interaction.options.getString('type');
        await interaction.deferReply({ ephemeral: true });

        try {
            const backup = {
                id: uuidv4(),
                creator: interaction.user.id,
                timestamp: Date.now(),
                type,
                data: {}
            };

            switch (type) {
                case 'all':
                case 'roles':
                    backup.data.roles = await this.backupRoles(interaction.guild);
                    if (type === 'all') {
                        backup.data.channels = await this.backupChannels(interaction.guild);
                        backup.data.emojis = await this.backupEmojis(interaction.guild);
                        backup.data.bans = await this.backupBans(interaction.guild);
                    }
                    break;

                case 'channels':
                    backup.data.channels = await this.backupChannels(interaction.guild);
                    break;

                case 'emojis':
                    backup.data.emojis = await this.backupEmojis(interaction.guild);
                    break;

                case 'bans':
                    backup.data.bans = await this.backupBans(interaction.guild);
                    break;
            }

            Database.addBackup(interaction.guild.id, backup);

            await interaction.editReply({
                content: `Backup created successfully! ID: \`${backup.id}\``,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error creating backup:', error);
            await interaction.editReply({
                content: 'There was an error while creating the backup!',
                ephemeral: true
            });
        }
    },

    async listBackups(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const backups = Database.getBackups(interaction.guild.id);

            if (backups.length === 0) {
                await interaction.editReply({
                    content: 'No backups found!',
                    ephemeral: true
                });
                return;
            }

            const backupList = backups.map(backup => {
                const date = new Date(backup.timestamp).toLocaleString();
                return `**ID:** \`${backup.id}\`\n**Type:** ${backup.type}\n**Created:** ${date}\n**Creator:** <@${backup.creator}>`;
            }).join('\n\n');

            await interaction.editReply({
                content: `**Available Backups:**\n\n${backupList}`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error listing backups:', error);
            await interaction.editReply({
                content: 'There was an error while listing the backups!',
                ephemeral: true
            });
        }
    },

    async loadBackup(interaction) {
        const backupId = interaction.options.getString('id');
        await interaction.deferReply({ ephemeral: true });

        try {
            const backup = Database.getBackup(interaction.guild.id, backupId);

            if (!backup) {
                await interaction.editReply({
                    content: 'Backup not found!',
                    ephemeral: true
                });
                return;
            }

            switch (backup.type) {
                case 'all':
                    await this.loadRoles(interaction.guild, backup.data.roles);
                    await this.loadChannels(interaction.guild, backup.data.channels);
                    await this.loadEmojis(interaction.guild, backup.data.emojis);
                    await this.loadBans(interaction.guild, backup.data.bans);
                    break;

                case 'roles':
                    await this.loadRoles(interaction.guild, backup.data.roles);
                    break;

                case 'channels':
                    await this.loadChannels(interaction.guild, backup.data.channels);
                    break;

                case 'emojis':
                    await this.loadEmojis(interaction.guild, backup.data.emojis);
                    break;

                case 'bans':
                    await this.loadBans(interaction.guild, backup.data.bans);
                    break;
            }

            await interaction.editReply({
                content: 'Backup loaded successfully!',
                ephemeral: true
            });
        } catch (error) {
            console.error('Error loading backup:', error);
            await interaction.editReply({
                content: 'There was an error while loading the backup!',
                ephemeral: true
            });
        }
    },

    async backupRoles(guild) {
        return guild.roles.cache.map(role => ({
            id: role.id,
            name: role.name,
            color: role.hexColor,
            hoist: role.hoist,
            position: role.position,
            permissions: role.permissions.bitfield,
            mentionable: role.mentionable,
            icon: role.iconURL(),
            unicodeEmoji: role.unicodeEmoji
        }));
    },

    async backupChannels(guild) {
        return guild.channels.cache.map(channel => ({
            id: channel.id,
            name: channel.name,
            type: channel.type,
            parentId: channel.parentId,
            position: channel.position,
            permissionOverwrites: channel.permissionOverwrites.cache.map(overwrite => ({
                id: overwrite.id,
                type: overwrite.type,
                allow: overwrite.allow.bitfield,
                deny: overwrite.deny.bitfield
            }))
        }));
    },

    async backupEmojis(guild) {
        return guild.emojis.cache.map(emoji => ({
            id: emoji.id,
            name: emoji.name,
            url: emoji.url,
            animated: emoji.animated
        }));
    },

    async backupBans(guild) {
        const bans = await guild.bans.fetch();
        return bans.map(ban => ({
            userId: ban.user.id,
            reason: ban.reason
        }));
    },

    async loadRoles(guild, roles) {
        // Delete existing roles except @everyone
        const existingRoles = guild.roles.cache.filter(role => role.id !== guild.id);
        for (const role of existingRoles) {
            await role.delete();
        }

        // Create roles from backup
        for (const roleData of roles) {
            await guild.roles.create({
                name: roleData.name,
                color: roleData.color,
                hoist: roleData.hoist,
                position: roleData.position,
                permissions: roleData.permissions,
                mentionable: roleData.mentionable,
                icon: roleData.icon,
                unicodeEmoji: roleData.unicodeEmoji
            });
        }
    },

    async loadChannels(guild, channels) {
        // Delete existing channels
        for (const channel of guild.channels.cache) {
            await channel.delete();
        }

        // Create channels from backup
        for (const channelData of channels) {
            await guild.channels.create({
                name: channelData.name,
                type: channelData.type,
                parent: channelData.parentId,
                position: channelData.position,
                permissionOverwrites: channelData.permissionOverwrites
            });
        }
    },

    async loadEmojis(guild, emojis) {
        // Delete existing emojis
        for (const emoji of guild.emojis.cache) {
            await emoji.delete();
        }

        // Create emojis from backup
        for (const emojiData of emojis) {
            await guild.emojis.create({
                attachment: emojiData.url,
                name: emojiData.name
            });
        }
    },

    async loadBans(guild, bans) {
        // Remove existing bans
        const existingBans = await guild.bans.fetch();
        for (const ban of existingBans) {
            await guild.members.unban(ban.user.id);
        }

        // Apply bans from backup
        for (const banData of bans) {
            await guild.members.ban(banData.userId, { reason: banData.reason });
        }
    }
}; 