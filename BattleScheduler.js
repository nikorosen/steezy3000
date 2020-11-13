const CronJob = require('cron').CronJob;
const Discord = require('discord.js');
const config = require('./config.js');
const fs = require('fs');

var text = fs.readFileSync("./samples.txt").toString('utf-8');
var sampleList = text.split("\n");

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
        this.sample;
    }

    startBattleJob(client, cronTab, log) { //, announcement) {//, announceChannel, submitChannel) {

        const that = this;
        that.sample = sampleList[Math.floor(Math.random() * sampleList.length)]

        var job = new CronJob(cronTab, function () {

            that.sample = sampleList[Math.floor(Math.random() * sampleList.length)]

            var announcement = new Discord.MessageEmbed()
                .setColor(config.embed_color)
                .setTitle('🥁 Weekly Beat Battle 🥁')// + battleNum)
                .setDescription(' <@&' + config.everyone + '> IT\'S TIME FOR ANOTHER WEEKLY BEAT BATTLE 🔥\n\n\
            Brandish ya DAW, invite a friend, we bout to fl!p')
                .addFields(
                    { name: 'HOW TO SUBMIT', value: 'Type \'!submit [soundcloud-url]\' \n Your URL must follow the standard format: https://soundcloud.com/nikorosy/example-track' },
                    {
                        name: 'RULES', value:
                            '1️⃣   Use only the provided sample\n\
            2️⃣   You may use your own drums/instruments but the sample must be prominent\
            3️⃣   If you submit, you MUST vote\n\
            4️⃣   Bring the heat!!!'},
                    { name: 'THIS WEEK\'S SAMPLE', value: that.sample },
                    { name: 'BATTLE START', value: 'Friday 12:00PM PST', inline: true },
                    { name: 'BATTLE END', value: 'Saturday 11:59PM PST', inline: true },
                    { name: 'Follow us on IG', value: 'https://www.instagram.com/steezyproducers' })
                .setFooter('👁')
                .setTimestamp();

            client.channels.cache.get(config.announce_channel_id)
                .send(announcement);

            that.isSubmitOpen = true;

            console.log('Battle submit is now ' + that.isSubmitOpen);
            console.log(log);

            var submitAnnouncement = new Discord.MessageEmbed()
                .setColor(config.embed_color)
                .setTitle('👇 Battle Submissions Below 👇')
                .setTimestamp();
            client.channels.cache.get(config.submit_channel_id).send(submitAnnouncement);

        }, null, true, config.timezone);

        job.start();
    };

    startVoteJob(client, cronTab, log) {//}, announcement) {

        const that = this;

        var job = new CronJob(cronTab, function () {

            var announcement = new Discord.MessageEmbed()
                .setColor(config.embed_color)
                .setTitle('🥁 Weekly Beat Battle 🥁')
                .setDescription(' <@&' + config.everyone + '> VOTING BEGINS NOW\n\n')
                .addFields(
                    { name: 'HOW TO VOTE', value: 'Type !vote @user' },
                    { name: 'VOTE START', value: 'Saturday 11:59PM PST', inline: true },
                    { name: 'VOTE END', value: 'Sunday 8:00PM PST', inline: true },
                    { name: 'INSTAGRAM', value: 'https://www.instagram.com/steezyproducers' },
                )
                .setTimestamp()
                .setFooter('👁');

            client.channels.cache.get(config.announce_channel_id)
                .send(announcement);

            that.isSubmitOpen = false;
            that.isVoteOpen = true;

            console.log(log);
        }, null, true, config.timezone);

        job.start();
    };

    endBattleJob(client, cronTab, log){//, announcement) {//}, announceChannel) {

        const that = this;

        var job = new CronJob(cronTab, function () {

            var announcement = new Discord.MessageEmbed()
                .setColor(config.embed_color)
                .setTitle('🥁 Weekly Beat Battle 🥁')
                .setDescription(' <@&' + config.everyone + '> VOTING HAS ENDED, CONGRATS TO ' + getWinner(that.userList) + '\n\
                Join us for next week\'s battle!')
                .addFields(
                    //{ name: 'WINNING BEAT', value: '[url]', inline: true },
                    { name: 'INSTAGRAM', value: 'https://www.instagram.com/steezyproducers' },
                )
                .setFooter('👁')
                .setTimestamp();

            client.channels.cache.get(config.announce_channel_id).send(announcement);
            
            that.isVoteOpen = false;
            
            console.log(log);
        }, null, true, config.timezone);

        job.start();
    };

}