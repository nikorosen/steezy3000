// STEEZY3000 Discord Bot driver
// Author: Niko R.
// 11/12/2020

const config = require('./config.js');
const { timeStamp } = require('console');
const Discord = require('discord.js');
const fs = require('fs');
const CronJob = require('cron').CronJob;
const BattleScheduler = require('./BattleScheduler.js');
const { finished } = require('stream');

const prefix = '!';
const client = new Discord.Client();

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

const battleScheduler = new BattleScheduler();
battleScheduler.client = client;

// updates users-list.txt
function writeUsers(battleScheduler) {
    var writer = fs.createWriteStream(config.user_list_path)
    for (id in battleScheduler.userList) {
        console.log(id + ' ' + battleScheduler.userList[id] + '\n');
        writer.write(id + ' ' + battleScheduler.userList[id] + '\n', (err) => {
            if (err) throw err;
        });
    }

    writer.close();
}

function readUsers(battleScheduler) {
    if (fs.readFileSync(config.user_list_path).length != 0) {
        fs.readFile(config.user_list_path, function (err, f) {
            var userListData = f.toString().split('\n');
            //console.log(userList);
            //console.log(userList[0]);
            //console.log(userList[1]);
            //var userList;
            var userId;
            var userVotes;
            var line;

            for (i = 0; i < userListData.length; i++) {

                if (userListData[i] != '') {
                    line = userListData[i].toString().split(' ')
                    console.log('line: ' + line);
                    console.log('userid: ' + line[0]);
                    console.log('uservotes: ' + line[1]);

                    userId = line[0];
                    userVotes = line[1];
                    battleScheduler.userList[userId] = userVotes;
                }
            }
        });
    }
}

function initSchedule() {

    //var startCron = '* * * * *';
    //var voteCron = '* * * * *';
    //var endCron = '* * * * *';

    var startCron = '0 12 * * 5';
    var voteCron = '59 23 * * 6';
    var endCron = '0 20 * * 0';

    battleScheduler.startJobs(startCron, voteCron, endCron);
}

// bot status
client.once('ready', () => {
    console.log('STEEZY3000 is online');
    initSchedule();
    console.log('Cron jobs started');
});

client.on('message', message => {

    if (!message.content.startsWith(prefix) || message.author.bot) return

    // parse command and args
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ping')
        client.commands.get('ping').execute(message, args);

    // track submit
    else if (command === 'submit') {

        readUsers(battleScheduler);

        // add user to userlist
        if (args.length != 0 && args.length < 2) {
            client.commands.get('submit').execute(client, message, battleScheduler, args);
            writeUsers(battleScheduler);
        }
        // err
        else
            message.channel.send('Something went wrong. Please type \'!submit [soundcloud-url]\' to submit');
    }

    // track vote
    else if (command === 'vote') {

        readUsers(battleScheduler);

        // add vote for a user
        if (args.length != 0 && args.length < 2) {
            client.commands.get('vote').execute(client, message, battleScheduler, args);
            writeUsers(battleScheduler);
        }

        // err
        else {
            message.channel.send('Something went wrong. Please type \'!vote @user\' to vote');
        }
    }

    // Debug/Admin controls
    else if (message.member.roles.cache.find(r => r.name === "Big Chief")) {

        readUsers(battleScheduler);

        if (command === 'start-battle'){
            battleScheduler.startBattle();
        }
        else if (command === 'start-vote'){
            battleScheduler.startVote();
        }
        else if (command === 'end-battle'){
            battleScheduler.endBattle();
        }

        if (command === 'open-vote') {
            battleScheduler.isSubmitOpen = false;
            battleScheduler.isVoteOpen = true;
            console.log('Vote now open')
        }

        else if (command === 'open-submit') {
            battleScheduler.isSubmitOpen = true;
            battleScheduler.isVoteOpen = false;
            console.log('Submit now open')
        }

        else if (command === 'open-vote') {
            battleScheduler.isSubmitOpen = false;
            battleScheduler.isVoteOpen = true;
            console.log('Vote now open')
        }

        else if (command === 'submit-d') {

            client.channels.cache.get(config.submit_channel_id).send(args[0] + ' -- ' + args[1])

            battleScheduler.userList[args[0]] = 0;

            console.log('userlist: ' + battleScheduler.userList)
            writeUsers(battleScheduler);

            console.log('submit executed');
        }

        else if (command === 'vote-d') {

            // add vote for a user
            if (args.length != 0 && args.length < 2) {


                if (battleScheduler.userList.hasOwnProperty(args)) {
                    battleScheduler.userList[args]++;
                    battleScheduler.userHasVoted.push(message.author.id)

                    writeUsers(battleScheduler);

                    client.commands.get('vote').execute(client, message, args);
                }
                else
                    message.channel.send('This user did not participate. Please type \'!vote @user\' to vote');
            }

            // err
            else {
                message.channel.send('Something went wrong. Please type \'!vote @user\' to vote');
                console.log('vote executed');
            }
        }

    } else message.channel.send('Sorry, you\'re not allowed to do that');

});

client.login(config.bot_token);

