const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const COLORS = {
    DEFAULT: '#fcfcfc',
    PRIMARY: '#6e338d',
    SECONDARY: '#7e359c',
    ACCENT: '#8e38ac',
    HIGHLIGHT: '#9e3bbc'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Créer un embed personnalisé')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Titre de l\'embed')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Description de l\'embed')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Couleur de l\'embed')
                .addChoices(
                    { name: 'Blanc', value: 'DEFAULT' },
                    { name: 'Violet Clair', value: 'PRIMARY' },
                    { name: 'Violet Moyen', value: 'SECONDARY' },
                    { name: 'Violet Foncé', value: 'ACCENT' },
                    { name: 'Violet Intense', value: 'HIGHLIGHT' }
                )
                .setRequired(false))
        .addStringOption(option =>
            option.setName('image')
                .setDescription('URL de l\'image à ajouter')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('thumbnail')
                .setDescription('URL de la vignette à ajouter')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('footer')
                .setDescription('Texte du footer')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const color = interaction.options.getString('color') || 'DEFAULT';
        const image = interaction.options.getString('image');
        const thumbnail = interaction.options.getString('thumbnail');
        const footer = interaction.options.getString('footer');

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(COLORS[color])
            .setTimestamp();

        if (image) embed.setImage(image);
        if (thumbnail) embed.setThumbnail(thumbnail);
        if (footer) embed.setFooter({ text: footer });

        try {
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erreur dans la commande embed:', error);
            await interaction.reply({
                content: 'Une erreur est survenue lors de la création de l\'embed !',
                ephemeral: true
            });
        }
    },
}; 