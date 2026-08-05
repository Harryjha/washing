const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ─── Admin: Get all store admins with assigned store ──────────────────────────
router.get('/', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const storeAdmins = await prisma.user.findMany({
      where: { role: 'STORE_ADMIN' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        storeId: true,
        createdAt: true,
      },
    });

    // Fetch store details manually if storeId exists
    const storeIds = storeAdmins.map(sa => sa.storeId).filter(Boolean);
    const stores = await prisma.store.findMany({
      where: { id: { in: storeIds } },
      select: { id: true, name: true, address: true },
    });

    const storeMap = {};
    stores.forEach(s => {
      storeMap[s.id] = s;
    });

    const result = storeAdmins.map(sa => ({
      ...sa,
      store: sa.storeId ? storeMap[sa.storeId] || null : null,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching store admins:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Admin: Create/Register a new Store Admin ─────────────────────────────────
router.post('/', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { name, email, password, phone, storeId } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStoreAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: 'STORE_ADMIN',
        storeId: storeId || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        storeId: true,
        createdAt: true,
      },
    });

    res.status(201).json(newStoreAdmin);
  } catch (error) {
    console.error('Error creating store admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Admin: Update an existing Store Admin ────────────────────────────────────
router.put('/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, storeId, password } = req.body;

    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (storeId !== undefined) dataToUpdate.storeId = storeId || null;
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
        createdAt: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating store admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Admin: Delete a Store Admin ─────────────────────────────────────────────
router.delete('/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: 'Store Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting store admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
