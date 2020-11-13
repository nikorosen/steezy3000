// STEEZY3000 Discord Bot driver
// Author: Niko R.
// 11/12/2020

const config = require('./config.js');
const { timeStamp } = require('console');
const Discord = require('discord.js');
const fs = require('fs');
const CronJob = require('cron').CronJob;
const BattleScheduler = require('./BattleScheduler.js');

const prefix = '!';
const client = new Discord.Client();
client.commands = new Discord.Collection();

const battleScheduler = new BattleScheduler();

function initSchedule(client) {

    log = "Battle started";
    battleScheduler.startBattleJob(client, '0 12 * * 5', log, announcement);
    //battleScheduler.startBattleJob(client, '* * * * *', log)//, announcement);

    log = "Voting started";
    battleScheduler.startVoteJob(client, '59 23 * * 6', log)//, announcement);
    //battleScheduler.startVoteJob(client, '* * * * *', log)//, announcement);

    log = "Battle ended";
    battleScheduler.endBattleJob(client, '0 20 * * 0', log)//, announcement);
    //battleScheduler.endBattleJob(client, '* * * * *', log)//, announcement);
};

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// bot status
client.once('ready', () => {
    console.log('STEEZY3000 is online');
    console.log('Starting cron jobs...');
    initSchedule(client);
    console.log('Cron jobs started');
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    // ping
    if (command === 'ping')
        client.commands.get('ping').execute(message, args);

    // track submit
    else if (command === 'submit') {
        console.log(message.author.id + ' attempted submit');
        console.log('Submit is ' + battleScheduler.isSubmitOpen);
        if (!battleScheduler.isSubmitOpen)
            message.channel.send('Sorry, submissions are currently closed');
        else if (battleScheduler.userList.hasOwnProperty(args))
            message.channel.send('Sorry, you have already submitted');
        else if (args.length != 0 && args.length < 2) {
            client.commands.get('submit').execute(client, message, args);
            battleScheduler.userList['<@!' + message.author.id + '>'] = 0;
        }
        else
            message.channel.send('Something went wrong. Please type \'!submit [soundcloud-url]\' to submit');

        console.log('submit executed');
    }

    // track vote
    else if (command === 'vote') {
        console.log(message.author.id + ' attempted vote');
        console.log('Voting is ' + battleScheduler.isVoteOpen);
        if (!battleScheduler.isVoteOpen)
            message.channel.send('Sorry, voting is currently closed');
        else if (battleScheduler.userHasVoted.includes(message.author.id))
            message.channel.send('Sorry, you have already voted');
        else if (args.length != 0 && args.length < 2) {
            client.commands.get('vote').execute(client, message, args);

            if (battleScheduler.userList.hasOwnProperty(args)) {
                battleScheduler.userList[args]++;
                battleScheduler.userHasVoted.push(message.author.id)
            }
            else
                message.channel.send('This user did not participate. Please type \'!vote @user\' to vote');
        }
        else {
            message.channel.send('Something went wrong. Please type \'!vote @user\' to vote');
            console.log('vote executed');
        }
    }

    // debug display
    else if (command === 'display') {
        for (var key in battleScheduler.userList) {
            // check if the property/key is defined in the object itself, not in parent
            if (battleScheduler.userList.hasOwnProperty(key)) {
                console.log(key, battleScheduler.userList[key]);
            }
        }
    }

    //else if (command === 'winner') {
    //message.channel.send(getWinner(battleScheduler.userList));
    //}
});

client.login(config.bot_token);

