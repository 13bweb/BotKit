<div align="center">
  <h1>🤖 BotKit</h1>
  <p>A powerful Discord moderation bot with anti-raid protection and backup features</p>
  
  ![Discord.js Version](https://img.shields.io/badge/discord.js-v14-blue.svg)
  ![License](https://img.shields.io/badge/license-MIT-green.svg)
  [![Stars](https://img.shields.io/github/stars/13bweb/BotKit?style=social)](https://github.com/13bweb/BotKit)
</div>

# BotKit - Discord Bot

A comprehensive Discord bot with moderation and management features.

## Features

- User Moderation (warn, ban, kick, mute)
- Channel Management (nuke, lock, unlock)
- Backup Management
- Anti-Raid Protection
- Role Management
- Voice Channel Management

## Installation

1. Clone the repository
```bash
git clone https://github.com/13bweb/BotKit.git
cd BotKit
```

2. Install dependencies:
```bash
npm install
```

3. Create a `config.json` file in the root directory with the following structure:
```json
{
  "token": "YOUR_BOT_TOKEN",
  "clientId": "YOUR_BOT_CLIENT_ID",
  "guildId": "YOUR_GUILD_ID",
  "ownerID": "YOUR_OWNER_ID",
  "prefix": "!",
  "database": {
    "warns": "./data/warns.json",
    "bans": "./data/bans.json",
    "mutes": "./data/mutes.json",
    "backups": "./data/backups.json",
    "temproles": "./data/temproles.json"
  }
}
```

4. Deploy the slash commands:
```bash
node deploy-commands.js
```

5. Start the bot:
```bash
npm start
```

## Commands

### Moderation
- `/warn <member> <reason>` - Warn a member
- `/ban <member> [reason]` - Ban a member
- `/kick <member> [reason]` - Kick a member
- `/mute <member> <duration> [reason]` - Mute a member
- `/clear <number> [member]` - Clear messages

### Channel Management
- `/nuke` - Delete and recreate the current channel
- `/lock [channel/all]` - Lock a channel or all channels
- `/unlock [channel/all]` - Unlock a channel or all channels

### Role Management
- `/addrole <member> <role>` - Add a role to a member
- `/delrole <member> <role>` - Remove a role from a member
- `/temprole <member> <role> <duration>` - Temporarily assign a role

### Backup Management
- `/backup create <type>` - Create a backup
- `/backup load <id>` - Load a backup
- `/backup list` - List all backups

### Anti-Raid Protection
- `/antiautomod <on/off/max>` - Configure auto-moderation
- `/antiban <on/off/max>` - Configure anti-ban protection
- `/antibot <on/off/max>` - Configure anti-bot protection

### �� Utility
- `/embed` - Create beautiful custom embeds
- `/creator` - Display information about the bot creator
- Custom color scheme:
  - `#fcfcfc` - Default theme
  - `#6e338d` - Primary actions
  - `#7e359c` - Secondary actions
  - `#8e38ac` - Accent elements
  - `#9e3bbc` - Highlight elements

## Requirements

- Node.js 16.9.0 or higher
- Discord.js v14
- A Discord Bot Token

## License

MIT 

## 👨‍💻 Creator

This bot was created by [13bweb](https://github.com/13bweb). Feel free to check out my other projects on GitHub!

## 🌟 Credits

- Bot Developer: [@13bweb](https://github.com/13bweb)
- Built with [Discord.js](https://discord.js.org/) 