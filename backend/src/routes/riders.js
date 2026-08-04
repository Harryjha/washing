const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ─── Admin: Get all riders with assigned stores ────────────────────────────────
router.get('/', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const riders = await prisma.user.findMany({
      where: { role: 'RIDER' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        storeId: true,
        stores: { select: { id: true, name: true, address: true } },
        createdAt: true,
        _count: { select: { deliveries: true } },
      },
    });
    res.json(riders);
  } catch (error) {
    console.error('Error fetching riders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Admin: Create/Register a new Rider with multiple store hubs ───────────────
router.post('/', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { name, email, password, phone, storeId, storeIds } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Normalize storeIds array
    let targetStoreIds = [];
    if (Array.isArray(storeIds) && storeIds.length > 0) {
      targetStoreIds = storeIds.filter(Boolean);
    } else if (storeId) {
      targetStoreIds = [storeId];
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newRider = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        storeId: targetStoreIds[0] || null,
        role: 'RIDER',
        stores: targetStoreIds.length > 0 ? {
          connect: targetStoreIds.map(id => ({ id }))
        } : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        storeId: true,
        stores: { select: { id: true, name: true } },
        createdAt: true,
      },
    });

    res.status(201).json(newRider);
  } catch (error) {
    console.error('Error creating rider:', error);
    res.status(500).json({ error: 'Failed to create rider' });
  }
});

// ─── Admin: Update rider (multiple stores & password) ───────────────────────────
router.put('/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, storeId, storeIds, password } = req.body;

    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (phone !== undefined) dataToUpdate.phone = phone;

    // Handle multiple storeIds
    if (Array.isArray(storeIds)) {
      const validIds = storeIds.filter(Boolean);
      dataToUpdate.storeId = validIds[0] || null;
      dataToUpdate.stores = {
        set: validIds.map(sId => ({ id: sId }))
      };
    } else if (storeId !== undefined) {
      dataToUpdate.storeId = storeId || null;
      dataToUpdate.stores = storeId ? {
        set: [{ id: storeId }]
      } : { set: [] };
    }

    if (password && password.trim() !== '') {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        storeId: true,
        stores: { select: { id: true, name: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating rider:', error);
    res.status(500).json({ error: 'Failed to update rider' });
  }
});

// ─── Admin: Delete rider ───────────────────────────────────────────────────────
router.delete('/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.order.updateMany({
      where: { riderId: Number(id) },
      data: { riderId: null },
    });
    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: 'Rider deleted successfully' });
  } catch (error) {
    console.error('Error deleting rider:', error);
    res.status(500).json({ error: 'Failed to delete rider' });
  }
});

module.exports = router;
