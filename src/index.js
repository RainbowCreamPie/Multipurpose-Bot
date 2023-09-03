require('dotenv/config');

const { Client, GatewayIntentBits } = require('discord.js');
const { CommandKit } = require('commandkit');
const mongoose = require('mongoose')
const path = require('path');

const client = new Client({
    intents: [        
        GatewayIntentBits.Guilds,  
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,      
        GatewayIntentBits.MessageContent,
    ],
});

new CommandKit({
    client,
    eventsPath: path.join(__dirname, 'events'),
    commandsPath: path.join(__dirname, 'commands'),
});

(async () => {
    try {
        mongoose.set('strictQuery', false),
        await mongoose.connect(process.env.MONGO_URL);
        console.log('MongoDB | Status : Connected');
    } catch (error) {
        console.log(`Error: ${error}`);
    }
})();

client.login(process.env.TOKEN);