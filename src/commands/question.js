const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const prisma = require("../lib/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("question")
    .setDescription("Get a coding question")
    .addSubcommand((sub) =>
      sub.setName("daily").setDescription("Get today's daily question")
    )
    .addSubcommand((sub) =>
      sub
        .setName("topic")
        .setDescription("Get a question by topic")
        .addStringOption((opt) =>
          opt
            .setName("name")
            .setDescription("Topic name")
            .setRequired(true)
            .addChoices(
              { name: "Arrays", value: "Arrays" },
              { name: "Linked List", value: "Linked List" },
              { name: "Stack", value: "Stack" },
              { name: "Binary Search", value: "Binary Search" },
              { name: "Dynamic Programming", value: "Dynamic Programming" },
              { name: "Sliding Window", value: "Sliding Window" },
              { name: "Design", value: "Design" }
            )
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === "daily") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let daily = await prisma.dailyQuestion.findUnique({ where: { date: today } });

      if (!daily) {
        const count = await prisma.question.count();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
        const qIndex = (dayOfYear % count) + 1;

        daily = await prisma.dailyQuestion.create({
          data: { questionId: qIndex, date: today },
        });
      }

      const question = await prisma.question.findUnique({ where: { id: daily.questionId } });
      return interaction.reply({ embeds: [buildEmbed(question, "📅 Daily Question")] });
    }

    if (sub === "topic") {
      const topic = interaction.options.getString("name");
      const questions = await prisma.question.findMany({ where: { topic } });

      if (!questions.length) {
        return interaction.reply({ content: "No questions found for that topic yet!", ephemeral: true });
      }

      const question = questions[Math.floor(Math.random() * questions.length)];
      return interaction.reply({ embeds: [buildEmbed(question, `📚 ${topic}`)] });
    }
  },
};

function buildEmbed(q, label) {
  const colors = { Easy: 0x22c55e, Medium: 0xf59e0b, Hard: 0xef4444 };
  return new EmbedBuilder()
    .setTitle(`${label} — ${q.title}`)
    .setDescription(q.description)
    .addFields(
      { name: "Difficulty", value: q.difficulty, inline: true },
      { name: "Topic", value: q.topic, inline: true },
      { name: "Example", value: `\`\`\`\n${q.examples}\n\`\`\`` },
      { name: "💡 Hint", value: `||${q.hints || "No hint available"}||` }
    )
    .setColor(colors[q.difficulty] || 0x7c3aed)
    .setFooter({ text: `Question #${q.id} • Use /submit to submit your solution` });
}
