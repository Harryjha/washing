const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ─── GET /api/stores - Fetch all store hubs ──────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const stores = await prisma.store.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            riders: true,
            orders: true,
          },
        },
      },
    });

    // Also count store admins assigned to each store
    const storeAdmins = await prisma.user.findMany({
      where: { role: 'STORE_ADMIN', storeId: { not: null } },
      select: { storeId: true },
    });

    const adminCountMap = {};
    storeAdmins.forEach(sa => {
      if (sa.storeId) {
        adminCountMap[sa.storeId] = (adminCountMap[sa.storeId] || 0) + 1;
      }
    });

    const result = stores.map(store => ({
      ...store,
      _count: {
        ...store._count,
        storeAdmins: adminCountMap[store.id] || 0,
      },
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// ─── POST /api/stores - Create a new store hub (ADMIN only) ───────────────────
router.post('/', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;

    if (!name || !address) {
      return res.status(400).json({ error: 'Store name and address are required' });
    }

    const latNum = latitude !== undefined && latitude !== null && !isNaN(Number(latitude)) ? Number(latitude) : 12.9716;
    const lngNum = longitude !== undefined && longitude !== null && !isNaN(Number(longitude)) ? Number(longitude) : 77.5946;

    const newStore = await prisma.store.create({
      data: {
        name: name.trim(),
        address: address.trim(),
        latitude: latNum,
        longitude: lngNum,
      },
    });

    res.status(201).json(newStore);
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ error: 'Failed to create store' });
  }
});

// ─── DELETE /api/stores/clear-all - Delete all store hubs (ADMIN only) ─────────
router.delete('/clear-all', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    // Disassociate users (riders & store admins) and orders first
    await prisma.user.updateMany({
      where: { storeId: { not: null } },
      data: { storeId: null },
    });

    await prisma.order.updateMany({
      where: { storeId: { not: null } },
      data: { storeId: null },
    });

    // Delete all stores
    const deleted = await prisma.store.deleteMany({});

    res.json({ message: `Successfully cleared ${deleted.count} stores.` });
  } catch (error) {
    console.error('Error clearing stores:', error);
    res.status(500).json({ error: 'Failed to clear stores' });
  }
});

// ─── DELETE /api/stores/:id - Delete a specific store hub (ADMIN only) ─────────
router.delete('/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.store.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Unassign users and orders linked to this store
    await prisma.user.updateMany({
      where: { storeId: id },
      data: { storeId: null },
    });

    await prisma.order.updateMany({
      where: { storeId: id },
      data: { storeId: null },
    });

    await prisma.store.delete({ where: { id } });

    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Error deleting store:', error);
    res.status(500).json({ error: 'Failed to delete store' });
  }
});

module.exports = router;
