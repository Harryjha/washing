const { PrismaClient } = require('@prisma/client');
const { findNearestStore } = require('../utils/geo');

const prisma = new PrismaClient();

/**
 * Customer: Create Order with direct routing to nearest store
 */
async function createOrder(req, res) {
  try {
    const {
      serviceType,
      itemsDescription,
      pickupAddress,
      pickupLatitude,
      pickupLongitude,
      pickupLandmark,
      pickupDate,
      specialNote,
    } = req.body;

    if (!pickupAddress) {
      return res.status(400).json({ error: 'Pickup address is required' });
    }

    const customerId = req.user.id;

    // Safely parse latitude & longitude to numbers or null (avoid NaN)
    const latNum = (pickupLatitude !== undefined && pickupLatitude !== null && !isNaN(Number(pickupLatitude)))
      ? Number(pickupLatitude)
      : null;
    const lngNum = (pickupLongitude !== undefined && pickupLongitude !== null && !isNaN(Number(pickupLongitude)))
      ? Number(pickupLongitude)
      : null;

    // Fetch all stores to calculate nearest branch
    const stores = await prisma.store.findMany();
    let assignedStoreId = null;

    if (latNum !== null && lngNum !== null && stores.length > 0) {
      const geoResult = findNearestStore(latNum, lngNum, stores);
      if (geoResult && geoResult.store) {
        assignedStoreId = geoResult.store.id;
      }
    } else if (stores.length > 0) {
      // Default to first store (Koramangala) if lat/lng not provided
      assignedStoreId = stores[0].id;
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();

    const order = await prisma.order.create({
      data: {
        customerId,
        serviceType: serviceType || 'Standard Laundry',
        itemsDescription: itemsDescription || serviceType || 'Garments',
        pickupAddress,
        pickupLatitude: latNum,
        pickupLongitude: lngNum,
        pickupLandmark: pickupLandmark || null,
        pickupDate: (pickupDate && !isNaN(new Date(pickupDate).getTime())) ? new Date(pickupDate) : null,
        specialNote: specialNote || null,
        storeId: assignedStoreId,
        status: 'PENDING_PICKUP',
        verificationCode: code,
      },
      include: {
        store: true,
        customer: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
}

/**
 * Rider: Get tasks assigned to Rider's store
 */
async function getRiderTasks(req, res) {
  try {
    const riderId = req.user.id;
    const riderUser = await prisma.user.findUnique({
      where: { id: riderId },
      include: { stores: true },
    });

    // Support both single store (legacy) and multiple stores
    let assignedStoreIds = riderUser?.stores?.map(s => s.id) || [];
    if (assignedStoreIds.length === 0 && riderUser?.storeId) {
      assignedStoreIds = [riderUser.storeId];
    }

    const whereCondition = assignedStoreIds.length > 0
      ? { OR: [{ riderId: riderId }, { storeId: { in: assignedStoreIds } }, { storeId: null }] }
      : { OR: [{ riderId: riderId }, { storeId: null }] };

    const orders = await prisma.order.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true, address: true } },
        store: true,
      },
    });

    // Add verificationCode to the response for the rider
    res.json(orders);
  } catch (error) {
    console.error('Error fetching rider tasks:', error);
    res.status(500).json({ error: 'Failed to fetch rider tasks' });
  }
}

/**
 * Update Order Status (PATCH/PUT)
 */
async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, riderId, verificationCode } = req.body;

    const dataToUpdate = {};
    if (status) dataToUpdate.status = status;
    if (riderId !== undefined) dataToUpdate.riderId = riderId ? Number(riderId) : req.user.id;

    // Automatically set riderId when rider accepts task
    if (req.user.role === 'RIDER' && !dataToUpdate.riderId && status !== 'DELIVERED') {
      dataToUpdate.riderId = req.user.id;
    }

    if (status === 'PICKED_UP' || status === 'DELIVERED') {
      const order = await prisma.order.findUnique({ where: { id: Number(id) } });
      // Only RIDER needs to verify code. Store Admins use the specific /receive endpoint,
      // but if they hit this, we should be careful. Assuming only Rider hits this with code.
      if (req.user.role === 'RIDER' && order.verificationCode && order.verificationCode !== verificationCode) {
        return res.status(400).json({ error: 'Invalid verification code' });
      }

      if (status === 'PICKED_UP') {
        dataToUpdate.pickedUpAt = new Date();
      } else if (status === 'DELIVERED') {
        dataToUpdate.deliveredAt = new Date();
        dataToUpdate.deliveryRiderId = req.user.id;
      }
    }

    const updated = await prisma.order.update({
      where: { id: Number(id) },
      data: dataToUpdate,
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        store: true,
        rider: { select: { id: true, name: true, phone: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
}

/**
 * Get Single Order Details
 */
async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true, address: true } },
        store: true,
        rider: { select: { id: true, name: true, phone: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
}

/**
 * Get All Stores
 */
async function getStores(req, res) {
  try {
    const stores = await prisma.store.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
}

module.exports = {
  createOrder,
  getRiderTasks,
  updateOrderStatus,
  getOrderById,
  getStores,
};
