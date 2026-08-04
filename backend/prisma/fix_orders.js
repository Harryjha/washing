const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Checking and sanitizing order records in PostgreSQL...");
  try {
    const orders = await prisma.order.findMany();
    console.log(`Found ${orders.length} total orders in database.`);
    
    // Ensure all existing orders have valid status
    for (const o of orders) {
      if (!o.status) {
        await prisma.order.update({
          where: { id: o.id },
          data: { status: 'PENDING_PICKUP' },
        });
        console.log(`Updated status for order #${o.id}`);
      }
    }
  } catch (err) {
    console.error("Error inspecting orders:", err);
  }
}

main().finally(() => prisma.$disconnect());
