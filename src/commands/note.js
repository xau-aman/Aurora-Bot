const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const prisma = require("../lib/db");
const { ensureUser } = require("../lib/xp");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("note")
    .setDescription("Your second brain — save and search notes")
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Save a new note")
        .addStringOption((o) => o.setName("title").setDescription("Note title").setRequired(true))
        .addStringOption((o) => o.setName("content").setDescription("Note content").setRequired(true))
        .addStringOption((o) => o.setName("tags").setDescription("Comma-separated tags (e.g. dp,arrays)"))
    )
    .addSubcommand((sub) =>
      sub
        .setName("search")
        .setDescription("Search your notes")
        .addStringOption((o) => o.setName("query").setDescription("Search by title or tag").setRequired(true))
    ),

  async execute(interaction) {
    await ensureUser(interaction.user.id);
    const sub = interaction.options.getSubcommand();

    if (sub === "add") {
      const title = interaction.options.getString("title");
      const content = interaction.options.getString("content");
      const tagsRaw = interaction.options.getString("tags");
      const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim().toLowerCase()) : [];

      const note = await prisma.note.create({
        data: { userId: interaction.user.id, title, content, tags },
      });

      const embed = new EmbedBuilder()
        .setTitle("📝 Note Saved!")
        .addFields(
          { name: "Title", value: title },
          { name: "Tags", value: tags.length ? tags.map((t) => `\`${t}\``).join(" ") : "None" }
        )
        .setColor(0x3b82f6)
        .setFooter({ text: `Note #${note.id}` });

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "search") {
      const query = interaction.options.getString("query").toLowerCase();

      const notes = await prisma.note.findMany({
        where: {
          userId: interaction.user.id,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { tags: { has: query } },
          ],
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      });

      if (!notes.length) {
        return interaction.reply({ content: "No notes found. Try a different search!", ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle(`🔍 Notes matching "${query}"`)
        .setDescription(
          notes
            .map((n) => `**#${n.id} — ${n.title}**\n${n.content.slice(0, 100)}${n.content.length > 100 ? "..." : ""}\nTags: ${n.tags.map((t) => `\`${t}\``).join(" ") || "None"}`)
            .join("\n\n")
        )
        .setColor(0x3b82f6)
        .setFooter({ text: `${notes.length} result(s)` });

      return interaction.reply({ embeds: [embed] });
    }
  },
};
