import { Router } from 'express';
import prisma from '../db.ts';
import logger from '../services/logger.ts';

export const inventoryRouter = Router();

inventoryRouter.get('/', async (req, res) => {
  try {
    const items = await prisma.inventoryItem.findMany({ where: { tenantId: req.user!.tenantId }, orderBy: { name: 'asc' } });
    res.json(items);
  } catch (error) {
    logger.error({ error }, 'Inventory list error');
    res.status(500).json({ error: 'Error al cargar inventario' });
  }
});

inventoryRouter.post('/', async (req, res) => {
  try {
    const { name, description, category, quantity, minStock, price, supplier, batch, expiresAt } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre es obligatorio' });
    const item = await prisma.inventoryItem.create({
      data: { tenantId: req.user!.tenantId, name, description, category, quantity: quantity || 0, minStock: minStock || 5, price: price || 0, supplier, batch, expiresAt: expiresAt ? new Date(expiresAt) : null },
    });
    res.status(201).json(item);
  } catch (error) {
    logger.error({ error }, 'Inventory create error');
    res.status(500).json({ error: 'Error al crear item' });
  }
});

inventoryRouter.put('/:id', async (req, res) => {
  try {
    const item = await prisma.inventoryItem.update({ where: { id: req.params.id, tenantId: req.user!.tenantId }, data: req.body });
    res.json(item);
  } catch (error) {
    logger.error({ error }, 'Inventory update error');
    res.status(500).json({ error: 'Error al actualizar item' });
  }
});

inventoryRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.inventoryItem.delete({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
    res.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Inventory delete error');
    res.status(500).json({ error: 'Error al eliminar item' });
  }
});
