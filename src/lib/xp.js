const prisma = require("./db");

const XP_VALUES = { Easy: 10, Medium: 25, Hard: 50 };

async function ensureUser(userId) {
  return prisma.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });
}

async function awardXP(userId, difficulty) {
  const user = await ensureUser(userId);
  const xp = XP_VALUES[difficulty] || 10;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastActive = user.lastActive ? new Date(user.lastActive) : null;
  lastActive?.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let newStreak = 1;
  if (lastActive) {
    if (lastActive.getTime() === yesterday.getTime()) newStreak = user.streak + 1;
    else if (lastActive.getTime() === today.getTime()) newStreak = user.streak;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: xp }, streak: newStreak, lastActive: new Date() },
  });

  return { xpGained: xp, totalXP: updated.xp, streak: updated.streak };
}

module.exports = { ensureUser, awardXP };
