const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        
        // Set bot's initial presence
        client.user.setPresence({
            activities: [{ name: 'BotKit | /help', type: 0 }],
            status: 'online'
        });
    },
}; 