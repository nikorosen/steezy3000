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
        this.userList = {};
        this.userHasVoted = [];
        this.sample;
        this.client;
    }

    startBattle(){//client) {
        this.sample = sampleList[Math.floor(Math.random() * sampleList.length)]

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
                { name: 'THIS WEEK\'S SAMPLE', value: this.sample },
                { name: 'BATTLE END', value: 'NEXT Friday 12:00PM PST', inline: true },
                { name: 'Follow us on IG', value: 'https://www.instagram.com/steezyproducers' })
            .setFooter('👁')
            .setTimestamp();

        this.client.channels.cache.get(config.announce_channel_id)
            .send(announcement);

        this.isSubmitOpen = true;
        console.log('[battle started] -- submit is now ' + this.isSubmitOpen);

        var submitAnnouncement = new Discord.MessageEmbed()
            .setColor(config.embed_color)
            .setTitle('👇 Battle Submissions Below 👇')
            .setTimestamp();
        this.client.channels.cache.get(config.submit_channel_id).send(submitAnnouncement);
    }

    startVote() {//client) {
        var announcement = new Discord.MessageEmbed()
            .setColor(config.embed_color)
            .setTitle('🥁 Weekly Beat Battle 🥁')
            .setDescription(' <@&' + config.everyone + '> VOTING BEGINS NOW\n\n')
            .addFields(
                { name: 'HOW TO VOTE', value: 'Type !vote @user' },
                { name: 'VOTE END', value: '12 hours from the time of this post', inline: true },
                { name: 'Follow us on IG', value: 'https://www.instagram.com/steezyproducers' },
            )
            .setTimestamp()
            .setFooter('👁');

        this.client.channels.cache.get(config.announce_channel_id)
            .send(announcement);

        this.isSubmitOpen = false;
        this.isVoteOpen = true;

        console.log('[voting started] -- vote is now true');

    }

    endBattle() {//client) {
        var announcement = new Discord.MessageEmbed()
            .setColor(config.embed_color)
            .setTitle('🥁 Weekly Beat Battle 🥁')
            .setDescription(' <@&' + config.everyone + '> VOTING HAS ENDED, CONGRATS TO ' + getWinner(this.userList) + '\n\
        Join us for next week\'s battle!')
            .addFields(
                //{ name: 'WINNING BEAT', value: '[url]', inline: true },
                { name: 'Follow us on IG', value: 'https://www.instagram.com/steezyproducers' },
            )
            .setFooter('👁')
            .setTimestamp();

        this.client.channels.cache.get(config.announce_channel_id).send(announcement);

        this.isVoteOpen = false;

        this.userList = {};
        fs.writeFileSync(config.user_list_path, '', function () { console.log('done') });

        console.log('[battle ended] -- submit and vote is false');
    }

    startJobs(cronStart, cronVote, cronEnd) {
        const that = this;
        that.sample = sampleList[Math.floor(Math.random() * sampleList.length)]

        var jobStart = new CronJob(cronStart, function () {
            that.startBattle();
        }, null, true, config.timezone);

        var jobVote = new CronJob(cronVote, function () {
            that.startVote();
        }, null, true, config.timezone);

        var jobEnd = new CronJob(cronEnd, function () {
            that.endBattle();
        }, null, true, config.timezone);

        jobStart.start();
        jobVote.start();
        jobEnd.start();
    }

}