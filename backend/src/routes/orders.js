const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Customer: Create a new order
router.post('/', authenticate, authorize(['CUSTOMER']), async (req, res) => {
  try {
    const { itemsDescription, pickupAddress } = req.body;
    
    const order = await prisma.order.create({
      data: {
        customerId: req.user.id,
        itemsDescription,
        pickupAddress,
        status: 'PENDING'
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Customer: Get my orders
router.get('/my-orders', authenticate, authorize(['CUSTOMER']), async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { rider: { select: { name: true, phone: true } } }
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get all orders
router.get('/all', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        customer: { select: { name: true, phone: true } },
        rider: { select: { name: true, phone: true } }
      }
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Assign order to rider
router.put('/:id/assign', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { riderId } = req.body;

    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: { riderId: Number(riderId) }
    });
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rider: Get available or assigned orders
router.get('/rider-orders', authenticate, authorize(['RIDER']), async (req, res) => {
  try {
    // Orders assigned to this rider or pending (unassigned)
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { riderId: req.user.id },
          { riderId: null, status: 'PENDING' }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { name: true, phone: true, address: true } } }
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rider/Admin: Update order status
router.put('/:id/status', authenticate, authorize(['RIDER', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({ where: { id: Number(id) } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // If Rider is updating, ensure they are assigned to this order, or assign them if they accept a PENDING order
    let dataToUpdate = { status };
    if (req.user.role === 'RIDER' && !order.riderId && status === 'PICKED_UP') {
      dataToUpdate.riderId = req.user.id;
    } else if (req.user.role === 'RIDER' && order.riderId !== req.user.id) {
       return res.status(403).json({ error: 'Not authorized for this order' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: dataToUpdate
    });
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
