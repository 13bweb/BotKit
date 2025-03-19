const fs = require('fs');
const path = require('path');
const config = require('../config.json');

class Database {
    static read(filePath) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                return {};
            }
            throw error;
        }
    }

    static write(filePath, data) {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    }

    static addWarn(userId, guildId, reason, moderatorId) {
        const warns = this.read('./db/warns.json');
        if (!warns[guildId]) warns[guildId] = {};
        if (!warns[guildId][userId]) warns[guildId][userId] = [];

        warns[guildId][userId].push({
            reason,
            moderatorId,
            timestamp: Date.now()
        });

        this.write('./db/warns.json', warns);
        return warns[guildId][userId].length;
    }

    static getWarns(userId, guildId) {
        const warns = this.read('./db/warns.json');
        return warns[guildId]?.[userId] || [];
    }

    static clearWarns(userId, guildId) {
        const warns = this.read('./db/warns.json');
        if (warns[guildId]?.[userId]) {
            delete warns[guildId][userId];
            this.write('./db/warns.json', warns);
            return true;
        }
        return false;
    }

    static addBan(userId, guildId, reason, moderatorId, duration = null) {
        const bans = this.read('./db/bans.json');
        if (!bans[guildId]) bans[guildId] = {};

        bans[guildId][userId] = {
            reason,
            moderatorId,
            timestamp: Date.now(),
            duration
        };

        this.write('./db/bans.json', bans);
        return true;
    }

    static getBan(userId, guildId) {
        const bans = this.read('./db/bans.json');
        return bans[guildId]?.[userId];
    }

    static removeBan(userId, guildId) {
        const bans = this.read('./db/bans.json');
        if (bans[guildId]?.[userId]) {
            delete bans[guildId][userId];
            this.write('./db/bans.json', bans);
            return true;
        }
        return false;
    }

    static addMute(userId, guildId, reason, moderatorId, duration) {
        const mutes = this.read('./db/mutes.json');
        if (!mutes[guildId]) mutes[guildId] = {};

        mutes[guildId][userId] = {
            reason,
            moderatorId,
            timestamp: Date.now(),
            duration
        };

        this.write('./db/mutes.json', mutes);
        return true;
    }

    static getMute(userId, guildId) {
        const mutes = this.read('./db/mutes.json');
        return mutes[guildId]?.[userId];
    }

    static removeMute(userId, guildId) {
        const mutes = this.read('./db/mutes.json');
        if (mutes[guildId]?.[userId]) {
            delete mutes[guildId][userId];
            this.write('./db/mutes.json', mutes);
            return true;
        }
        return false;
    }

    static addWarning(userId, guildId, reason, moderatorId) {
        const warnings = this.read('./db/warnings.json');
        if (!warnings[guildId]) warnings[guildId] = {};
        if (!warnings[guildId][userId]) warnings[guildId][userId] = [];

        warnings[guildId][userId].push({
            reason,
            moderatorId,
            timestamp: Date.now()
        });

        this.write('./db/warnings.json', warnings);
    }

    static getWarnings(userId, guildId) {
        const warnings = this.read('./db/warnings.json');
        return warnings[guildId]?.[userId] || [];
    }

    static clearWarnings(userId, guildId) {
        const warnings = this.read('./db/warnings.json');
        if (warnings[guildId]?.[userId]) {
            delete warnings[guildId][userId];
            this.write('./db/warnings.json', warnings);
        }
    }

    static addTempRole(userId, guildId, roleId, duration, moderatorId) {
        const tempRoles = this.read('./db/temp_roles.json');
        if (!tempRoles[guildId]) tempRoles[guildId] = {};
        if (!tempRoles[guildId][userId]) tempRoles[guildId][userId] = {};

        tempRoles[guildId][userId][roleId] = {
            moderatorId,
            timestamp: Date.now(),
            duration
        };

        this.write('./db/temp_roles.json', tempRoles);
    }

    static removeTempRole(userId, guildId, roleId) {
        const tempRoles = this.read('./db/temp_roles.json');
        if (tempRoles[guildId]?.[userId]?.[roleId]) {
            delete tempRoles[guildId][userId][roleId];
            this.write('./db/temp_roles.json', tempRoles);
        }
    }

    static getTempRole(userId, guildId, roleId) {
        const tempRoles = this.read('./db/temp_roles.json');
        return tempRoles[guildId]?.[userId]?.[roleId];
    }

    static getTempRoles(userId, guildId) {
        const tempRoles = this.read('./db/temp_roles.json');
        return tempRoles[guildId]?.[userId] || {};
    }

    static getAllTempRoles(guildId) {
        const tempRoles = this.read('./db/temp_roles.json');
        return tempRoles[guildId] || {};
    }

    static addBackup(guildId, backup) {
        const backups = this.read('./db/backups.json');
        if (!backups[guildId]) backups[guildId] = [];

        backups[guildId].push(backup);
        this.write('./db/backups.json', backups);
    }

    static getBackups(guildId) {
        const backups = this.read('./db/backups.json');
        return backups[guildId] || [];
    }

    static getBackup(guildId, backupId) {
        const backups = this.read('./db/backups.json');
        return backups[guildId]?.find(b => b.id === backupId);
    }

    static addToCache(cacheType, guildId, data) {
        const cache = this.read('./db/raid_cache.json');
        if (!cache[guildId]) cache[guildId] = {};
        if (!cache[guildId][cacheType]) cache[guildId][cacheType] = [];

        cache[guildId][cacheType].push({
            ...data,
            timestamp: Date.now()
        });

        cache[guildId][cacheType] = cache[guildId][cacheType].filter(entry => 
            Date.now() - entry.timestamp < 60000
        );

        this.write('./db/raid_cache.json', cache);
    }

    static getCache(cacheType, guildId) {
        const cache = this.read('./db/raid_cache.json');
        return cache[guildId]?.[cacheType] || [];
    }

    static clearCache(cacheType, guildId) {
        const cache = this.read('./db/raid_cache.json');
        if (cache[guildId]?.[cacheType]) {
            delete cache[guildId][cacheType];
            this.write('./db/raid_cache.json', cache);
        }
    }

    static clearAllCache(guildId) {
        const cache = this.read('./db/raid_cache.json');
        if (cache[guildId]) {
            delete cache[guildId];
            this.write('./db/raid_cache.json', cache);
        }
    }
}

module.exports = Database; 