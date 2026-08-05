const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createOrder,
  getRiderTasks,
  updateOrderStatus,
  getOrderById,
  getStores,
} = require('../controllers/orderController');

const router = express.Router();
const prisma = new PrismaClient();

// ─── Public / Common: Get Stores ───────────────────────────────────────────────
router.get('/stores', getStores);

// ─── Customer: Create a new order with nearest store calculation ──────────────
router.post('/', authenticate, authorize(['CUSTOMER']), createOrder);

// ─── Customer: Get my orders ───────────────────────────────────────────────────
router.get('/my-orders', authenticate, authorize(['CUSTOMER']), async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        rider: { select: { name: true, phone: true } },
        store: true,
      },
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Rider: Get tasks matching Rider's assigned store ─────────────────────────
router.get('/rider/tasks', authenticate, authorize(['RIDER', 'ADMIN']), getRiderTasks);
router.get('/rider-orders', authenticate, authorize(['RIDER', 'ADMIN']), getRiderTasks);

// ─── Admin: Get all orders (MUST BE DECLARED BEFORE GET /:id) ───────────────
router.get('/all', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        rider: { select: { name: true, phone: true } },
        deliveryRider: { select: { name: true, phone: true } },
        store: true,
      },
    });
    res.json(orders);
  } catch (error) {
    console.error('ALL ORDERS ERROR:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch all orders' });
  }
});

// ─── Get Single Order Details ──────────────────────────────────────────────────
router.get('/:id', authenticate, (req, res, next) => {
  if (isNaN(Number(req.params.id))) return next();
  return getOrderById(req, res);
});

// ─── Rider / Admin: Status Update Endpoint ─────────────────────────────────────
router.patch('/:id/status', authenticate, authorize(['RIDER', 'ADMIN']), updateOrderStatus);
router.put('/:id/status', authenticate, authorize(['RIDER', 'ADMIN']), updateOrderStatus);

// ─── Admin: Delete an order ────────────────────────────────────────────────────
router.delete('/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.order.delete({ where: { id: Number(id) } });
    res.json({ message: 'Order deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Admin: Assign order to rider ─────────────────────────────────────────────
router.put('/:id/assign', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { riderId } = req.body;
    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: { riderId: Number(riderId) },
    });
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
