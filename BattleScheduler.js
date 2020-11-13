const CronJob = require('cron').CronJob;
const Discord = require('discord.js');
const config = require('./config.js');

function getWinner(dict) {

    let index, max = 0;

    for (const [key, value] of Object.entries(dict)) {
        if (value > max) {
            max = value;
            index = key;
        }
    }

    return index;
}

module.exports = class BattleScheduler {

    constructor() {
        this.isSubmitOpen = false;
        this.isVoteOpen = false;
        this.userList = {}
        this.userHasVoted = []
    }

    startBattleJob(client, cronTab, log, announcement) {//, announceChannel, submitChannel) {

        const that = this;

        announcement
            .setTimestamp();

        var job = new CronJob(cronTab, function () {

            client.channels.cache.get(config.announce_channel_id).send(announcement);
            that.isSubmitOpen = true;
            console.log('Battle submit is now ' + that.isSubmitOpen);
            console.log(log);

            announcement = new Discord.MessageEmbed()
                .setColor(config.embed_color)
                .setTitle('👇 Battle Submissions Below 👇')
                .setTimestamp();
            client.channels.cache.get(config.submit_channel_id).send(announcement);

        }, null, true, config.timezone);

        job.start();
    };

    startVoteJob(client, cronTab, log, announcement) {

        const that = this;

        announcement
            .setTimestamp();

        var job = new CronJob(cronTab, function () {

            client.channels.cache.get(config.announce_channel_id)
                .send(announcement);
            that.isSubmitOpen = false;
            that.isVoteOpen = true;
            console.log(log);
        }, null, true, config.timezone);

        job.start();
    };

    endBattleJob(client, cronTab, log, announcement) {//}, announceChannel) {

        const that = this;

        var job = new CronJob(cronTab, function () {

            announcement
                .setDescription(' <@&' + config.everyone + '> VOTING HAS ENDED, CONGRATS TO ' + getWinner(that.userList) + '\n\
          Join us for next week\'s battle!')
                .setTimestamp();
            client.channels.cache.get(config.announce_channel_id).send(announcement);
            that.isVoteOpen = false;
            console.log(log);
        }, null, true, config.timezone);

        job.start();
    };

}