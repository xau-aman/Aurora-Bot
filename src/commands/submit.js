const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const prisma = require("../lib/db");
const { awardXP } = require("../lib/xp");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("submit")
    .setDescription("Submit your solution to a question")
    .addIntegerOption((opt) =>
      opt.setName("question_id").setDescription("Question ID").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("language").setDescription("Language used").setRequired(true)
        .addChoices(
          { name: "JavaScript", value: "javascript" },
          { name: "Python", value: "python" },
          { name: "C++", value: "cpp" },
          { name: "Java", value: "java" }
        )
    )
    .addStringOption((opt) =>
      opt.setName("code").setDescription("Your solution code").setRequired(true)
    ),

  async execute(interaction) {
    const questionId = interaction.options.getInteger("question_id");
    const language = interaction.options.getString("language");
    const code = interaction.options.getString("code");

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      return interaction.reply({ content: "Question not found!", ephemeral: true });
    }

    await prisma.submission.create({
      data: { userId: interaction.user.id, questionId, code, language },
    });

    const { xpGained, totalXP, streak } = await awardXP(interaction.user.id, question.difficulty);

    const embed = new EmbedBuilder()
      .setTitle("✅ Solution Submitted!")
      .setDescription(`**${question.title}** (${question.difficulty})`)
      .addFields(
        { name: "XP Earned", value: `+${xpGained} XP`, inline: true },
        { name: "Total XP", value: `${totalXP} XP`, inline: true },
        { name: "🔥 Streak", value: `${streak} day(s)`, inline: true }
      )
      .setColor(0x22c55e)
      .setFooter({ text: "Keep going! Consistency is key 💪" });

    return interaction.reply({ embeds: [embed] });
  },
};
