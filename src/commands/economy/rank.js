const { Client, Interaction, ApplicationCommandOptionType, AttachmentBuilder } = require('discord.js');
const level = require('../../models/level');
const calculateLevelXP = require('../../utils/calculateLevelXP');
const canvacord = require('canvacord')

module.exports = {
    /**
     * 
     * @param {Interaction} interaction 
     * @param {Client} client 
     */

    run : async ({ interaction, client }) => {
        if (!interaction.inGuild()) {
            interaction.reply('You can only run this command inside a server.');
            return;
        };

        await interaction.deferReply();

        const mentionedUserId = interaction.options.get('target-user')?.value;
        const targetUserId = mentionedUserId || interaction.member.id;
        const targetUserObj = await interaction.guild.members.fetch(targetUserId);

        const fetchedLevel = await level.findOne({
            userId : targetUserId,
            guildId : interaction.guild.id,
        });

        if (!fetchedLevel) {
            interaction.editReply(
                mentionedUserId
                    ? `${targetUserObj.user.tag} doesn't have any levels yet. Try again when they chat a little more.`
                    : "You don't have any levels yet. Chat a little more and try again."
            );
            return;
        }

        let allLevel = await level.find({ guildId : interaction.guild.id }).select(
            '-_id userId level xp'
        );

        allLevel.sort((a, b) => {
            if (a.level === b.level) {
                return b.xp - a.xp;
            } else {
                return b.level - a.level;
            }
        });

        let currentRank = allLevel.findIndex((lvl) => lvl.userId === targetUserId) + 1;

        const rank = new canvacord.Rank()
            .setBackground('COLOR', "#99ffff")
            .setAvatar(targetUserObj.user.displayAvatarURL({ size: 256 }))
            .setRank(currentRank)
            .setLevel(fetchedLevel.level)
            .setCurrentXP(fetchedLevel.xp)
            .setRequiredXP(calculateLevelXP(fetchedLevel.level))
            .setStatus(targetUserObj.presence.status)
            .setProgressBar(['#FF99FF', '#99FFFF'], 'GRADIENT')
            .setUsername(targetUserObj.user.username)
            .setDiscriminator(targetUserObj.user.discriminator);
        
        const data = await rank.build()
        const attachment = new AttachmentBuilder(data, { name: 'rank-card.png' });
        interaction.editReply({ files : [attachment] })

    },
    data : {
        name : 'rank',
        description  : "Show your/someone's rank",
        options : [
        {
            name : 'target-user',
            description: 'The user whose level you want to see',
            type: ApplicationCommandOptionType.Mentionable,
        },
    ],
    }
}