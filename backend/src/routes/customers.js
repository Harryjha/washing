const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ─── Admin: Get all customers ──────────────────────────────────────────────────
router.get('/', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });
    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Admin: Get single customer with orders ────────────────────────────────────
router.get('/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const customer = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!customer || customer.role !== 'CUSTOMER') {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Admin: Update customer ────────────────────────────────────────────────────
router.put('/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const updated = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { name, email, phone, address },
      select: { id: true, name: true, email: true, phone: true, address: true, role: true },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Admin: Delete customer ────────────────────────────────────────────────────
router.delete('/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    // Delete associated orders first to avoid FK constraint error
    await prisma.order.deleteMany({ where: { customerId: Number(req.params.id) } });
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
