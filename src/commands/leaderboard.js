const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const prisma = require("../lib/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View the top coders by XP"),

  async execute(interaction) {
    const users = await prisma.user.findMany({
      orderBy: { xp: "desc" },
      take: 10,
    });

    if (!users.length) {
      return interaction.reply({ content: "No one on the board yet. Be the first! 🚀", ephemeral: true });
    }

    const medals = ["🥇", "🥈", "🥉"];
    const lines = await Promise.all(
      users.map(async (u, i) => {
        const member = await interaction.guild.members.fetch(u.id).catch(() => null);
        const name = member?.displayName || "Unknown";
        const prefix = medals[i] || `**${i + 1}.**`;
        return `${prefix} ${name} — **${u.xp} XP** (🔥 ${u.streak})`;
      })
    );

    const embed = new EmbedBuilder()
      .setTitle("🏆 Leaderboard")
      .setDescription(lines.join("\n"))
      .setColor(0xf59e0b)
      .setFooter({ text: "Grind harder. Rise higher. ✨" });

    return interaction.reply({ embeds: [embed] });
  },
};
