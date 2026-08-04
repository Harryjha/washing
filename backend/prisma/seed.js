const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BANGALORE_STORES = [
  {
    name: "Koramangala Branch",
    address: "80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034",
    latitude: 12.9352,
    longitude: 77.6245,
  },
  {
    name: "Indiranagar Branch",
    address: "100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038",
    latitude: 12.9784,
    longitude: 77.6408,
  },
  {
    name: "HSR Layout Branch",
    address: "27th Main Road, Sector 1, HSR Layout, Bengaluru, Karnataka 560102",
    latitude: 12.9121,
    longitude: 77.6446,
  },
  {
    name: "Jayanagar Branch",
    address: "4th Block, 11th Main Road, Jayanagar, Bengaluru, Karnataka 560011",
    latitude: 12.9250,
    longitude: 77.5938,
  },
  {
    name: "Whitefield Branch",
    address: "ITPL Main Road, Pattandur Agrahara, Whitefield, Bengaluru, Karnataka 560066",
    latitude: 12.9698,
    longitude: 77.7499,
  },
  {
    name: "Malleshwaram Branch",
    address: "Sampige Road, 8th Cross, Malleshwaram, Bengaluru, Karnataka 560003",
    latitude: 13.0031,
    longitude: 77.5643,
  },
];

async function main() {
  console.log("Seeding Washington Laundrettes 6 Bangalore Stores...");
  for (const store of BANGALORE_STORES) {
    const existing = await prisma.store.findFirst({ where: { name: store.name } });
    if (!existing) {
      await prisma.store.create({ data: store });
      console.log(`Created store: ${store.name}`);
    } else {
      console.log(`Store already exists: ${store.name}`);
    }
  }

  // Update existing riders to belong to Koramangala branch by default if missing
  const koramangala = await prisma.store.findFirst({ where: { name: "Koramangala Branch" } });
  if (koramangala) {
    await prisma.user.updateMany({
      where: { role: "RIDER", storeId: null },
      data: { storeId: koramangala.id },
    });
    console.log("Updated riders with default Koramangala store assignment.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
