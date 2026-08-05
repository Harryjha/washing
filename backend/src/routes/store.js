const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ─── Store Admin: Get info about current store admin & store hub ──────────────
router.get('/info', authenticate, authorize(['STORE_ADMIN', 'ADMIN']), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        storeId: true,
      },
    });

    let store = null;
    if (user?.storeId) {
      store = await prisma.store.findUnique({
        where: { id: user.storeId },
      });
    }

    res.json({ user, store });
  } catch (error) {
    console.error('Error fetching store admin info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Store Admin: Get orders for their store ───────────────────────────────────
router.get('/orders', authenticate, authorize(['STORE_ADMIN', 'ADMIN']), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.storeId) {
      return res.json([]);
    }

    const orders = await prisma.order.findMany({
      where: { storeId: user.storeId },
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true, address: true } },
        store: true,
        rider: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching store orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Store Admin: Get riders assigned to their store ──────────────────────────
router.get('/riders', authenticate, authorize(['STORE_ADMIN', 'ADMIN']), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.storeId) {
      return res.json([]);
    }

    const storeId = user.storeId;
    const riders = await prisma.user.findMany({
      where: {
        role: 'RIDER',
        OR: [
          { stores: { some: { id: storeId } } },
          { storeId: storeId },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: { select: { deliveries: true } },
      },
    });

    res.json(riders);
  } catch (error) {
    console.error('Error fetching store riders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Store Admin: Confirm Order Received at Store Hub ────────────────────────
router.patch('/orders/:id/receive', authenticate, authorize(['STORE_ADMIN', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const order = await prisma.order.findUnique({ where: { id: Number(id) } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify order belongs to store admin's store (or ADMIN role)
    if (user.role === 'STORE_ADMIN' && order.storeId !== user.storeId) {
      return res.status(403).json({ error: 'Unauthorized to update order for another store' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status: 'RECEIVED_AT_STORE' },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true, address: true } },
        store: true,
        rider: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order receipt status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
