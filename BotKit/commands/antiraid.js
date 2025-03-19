const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Database = require('../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('antiraid')
        .setDescription('Configure anti-raid protection')
        .addSubcommand(subcommand =>
            subcommand
                .setName('config')
                .setDescription('Configure anti-raid settings')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type of protection to configure')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Auto-Mod', value: 'automod' },
                            { name: 'Anti-Ban', value: 'antiban' },
                            { name: 'Anti-Bot', value: 'antibot' },
                            { name: 'Anti-Channel', value: 'antichannel' },
                            { name: 'Anti-Deco', value: 'antideco' },
                            { name: 'Anti-Rank', value: 'antirank' },
                            { name: 'Anti-Kick', value: 'antikick' }
                        ))
                .addStringOption(option =>
                    option.setName('mode')
                        .setDescription('Protection mode')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Off', value: 'off' },
                            { name: 'On', value: 'on' },
                            { name: 'Maximum', value: 'max' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Check current anti-raid status'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'config':
                await this.configProtection(interaction);
                break;
            case 'status':
                await this.checkStatus(interaction);
                break;
        }
    },

    async configProtection(interaction) {
        const type = interaction.options.getString('type');
        const mode = interaction.options.getString('mode');

        await interaction.deferReply({ ephemeral: true });

        try {
            // Get current anti-raid settings
            const settings = Database.read('./db/antiraid.json');
            if (!settings[interaction.guild.id]) {
                settings[interaction.guild.id] = {};
            }

            // Update the specific protection type
            settings[interaction.guild.id][type] = mode;

            // Save the updated settings
            Database.write('./db/antiraid.json', settings);

            // Set up event listeners based on the type
            switch (type) {
                case 'automod':
                    this.setupAutoMod(interaction.guild, mode);
                    break;
                case 'antiban':
                    this.setupAntiBan(interaction.guild, mode);
                    break;
                case 'antibot':
                    this.setupAntiBot(interaction.guild, mode);
                    break;
                case 'antichannel':
                    this.setupAntiChannel(interaction.guild, mode);
                    break;
                case 'antideco':
                    this.setupAntiDeco(interaction.guild, mode);
                    break;
                case 'antirank':
                    this.setupAntiRank(interaction.guild, mode);
                    break;
                case 'antikick':
                    this.setupAntiKick(interaction.guild, mode);
                    break;
            }

            await interaction.editReply({
                content: `Successfully configured ${type} protection to ${mode} mode!`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error configuring anti-raid:', error);
            await interaction.editReply({
                content: 'There was an error while configuring the anti-raid protection!',
                ephemeral: true
            });
        }
    },

    async checkStatus(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const settings = Database.read('./db/antiraid.json');
            const guildSettings = settings[interaction.guild.id] || {};

            const status = Object.entries(guildSettings)
                .map(([type, mode]) => `${type}: ${mode}`)
                .join('\n');

            await interaction.editReply({
                content: `**Anti-Raid Protection Status:**\n\n${status || 'No protections configured'}`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error checking anti-raid status:', error);
            await interaction.editReply({
                content: 'There was an error while checking the anti-raid status!',
                ephemeral: true
            });
        }
    },

    setupAutoMod(guild, mode) {
        // Remove existing listeners
        guild.client.removeAllListeners('messageCreate');

        if (mode === 'off') return;

        // Add new listener based on mode
        guild.client.on('messageCreate', async message => {
            if (message.author.bot) return;

            const settings = Database.read('./db/antiraid.json');
            const guildSettings = settings[guild.id] || {};
            const currentMode = guildSettings.automod || 'off';

            if (currentMode === 'off') return;

            // Check for spam
            const userMessages = guild.client.messageCache.filter(m => 
                m.author.id === message.author.id && 
                Date.now() - m.createdTimestamp < 5000
            );

            if (userMessages.size > (currentMode === 'max' ? 3 : 5)) {
                await message.member.timeout(300000, 'Spam detection');
            }

            // Check for caps
            const capsCount = (message.content.match(/[A-Z]/g) || []).length;
            if (capsCount > message.content.length * 0.7) {
                await message.delete();
            }
        });
    },

    setupAntiBan(guild, mode) {
        guild.client.removeAllListeners('guildBanAdd');

        if (mode === 'off') return;

        guild.client.on('guildBanAdd', async ban => {
            const settings = Database.read('./db/antiraid.json');
            const guildSettings = settings[guild.id] || {};
            const currentMode = guildSettings.antiban || 'off';

            if (currentMode === 'off') return;

            // Get recent bans
            const recentBans = guild.client.banCache.filter(b => 
                Date.now() - b.createdTimestamp < 60000
            );

            if (recentBans.size > (currentMode === 'max' ? 2 : 3)) {
                // Revert all recent bans
                for (const [userId, banData] of recentBans) {
                    await guild.members.unban(userId, 'Anti-ban protection');
                }
            }
        });
    },

    setupAntiBot(guild, mode) {
        guild.client.removeAllListeners('guildMemberAdd');

        if (mode === 'off') return;

        guild.client.on('guildMemberAdd', async member => {
            const settings = Database.read('./db/antiraid.json');
            const guildSettings = settings[guild.id] || {};
            const currentMode = guildSettings.antibot || 'off';

            if (currentMode === 'off') return;

            if (member.user.bot) {
                const recentBots = guild.members.cache.filter(m => 
                    m.user.bot && 
                    Date.now() - m.joinedTimestamp < 60000
                );

                if (recentBots.size > (currentMode === 'max' ? 1 : 2)) {
                    await member.kick('Anti-bot protection');
                }
            }
        });
    },

    setupAntiChannel(guild, mode) {
        guild.client.removeAllListeners('channelCreate');

        if (mode === 'off') return;

        guild.client.on('channelCreate', async channel => {
            const settings = Database.read('./db/antiraid.json');
            const guildSettings = settings[guild.id] || {};
            const currentMode = guildSettings.antichannel || 'off';

            if (currentMode === 'off') return;

            const recentChannels = guild.channels.cache.filter(c => 
                Date.now() - c.createdTimestamp < 60000
            );

            if (recentChannels.size > (currentMode === 'max' ? 2 : 3)) {
                await channel.delete('Anti-channel protection');
            }
        });
    },

    setupAntiDeco(guild, mode) {
        guild.client.removeAllListeners('guildMemberRemove');

        if (mode === 'off') return;

        guild.client.on('guildMemberRemove', async member => {
            const settings = Database.read('./db/antiraid.json');
            const guildSettings = settings[guild.id] || {};
            const currentMode = guildSettings.antideco || 'off';

            if (currentMode === 'off') return;

            const recentLeaves = guild.client.leaveCache.filter(m => 
                Date.now() - m.timestamp < 60000
            );

            if (recentLeaves.size > (currentMode === 'max' ? 5 : 10)) {
                // Lock the server
                await guild.channels.cache.forEach(channel => {
                    channel.permissionOverwrites.edit(guild.roles.everyone, {
                        SendMessages: false
                    });
                });
            }
        });
    },

    setupAntiRank(guild, mode) {
        guild.client.removeAllListeners('guildMemberRoleUpdate');

        if (mode === 'off') return;

        guild.client.on('guildMemberRoleUpdate', async (oldMember, newMember) => {
            const settings = Database.read('./db/antiraid.json');
            const guildSettings = settings[guild.id] || {};
            const currentMode = guildSettings.antirank || 'off';

            if (currentMode === 'off') return;

            const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
            const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

            // Check for dangerous role changes
            if (addedRoles.some(role => role.permissions.has('Administrator')) ||
                removedRoles.some(role => role.permissions.has('Administrator'))) {
                // Revert the role changes
                await newMember.roles.set(oldMember.roles.cache);
            }
        });
    },

    setupAntiKick(guild, mode) {
        guild.client.removeAllListeners('guildMemberRemove');

        if (mode === 'off') return;

        guild.client.on('guildMemberRemove', async member => {
            const settings = Database.read('./db/antiraid.json');
            const guildSettings = settings[guild.id] || {};
            const currentMode = guildSettings.antikick || 'off';

            if (currentMode === 'off') return;

            const recentKicks = guild.client.kickCache.filter(k => 
                Date.now() - k.timestamp < 60000
            );

            if (recentKicks.size > (currentMode === 'max' ? 2 : 3)) {
                // Revert all recent kicks
                for (const [userId, kickData] of recentKicks) {
                    await guild.members.unban(userId, 'Anti-kick protection');
                }
            }
        });
    }
}; 