import { Router } from 'express';
import prisma from '../db.ts';
import { getTenantId } from '../middlewares/auth.ts';
import logger from '../services/logger.ts';

export const inventoryRouter = Router();

inventoryRouter.get('/', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const items = await prisma.inventoryItem.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
    res.json(items);
  } catch (error) {
    logger.error({ error }, 'Inventory list error');
    res.status(500).json({ error: 'Error al cargar inventario' });
  }
});

inventoryRouter.post('/', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { name, description, category, quantity, minStock, price, supplier, batch, expiresAt } = req.body;
    if (!name) return res.status(400).json({ error: 'Nombre requerido' });
    const item = await prisma.inventoryItem.create({
      data: { tenantId, name, description, category: category || 'General', quantity: quantity || 0, minStock: minStock || 5, price: price || 0, supplier, batch, expiresAt: expiresAt ? new Date(expiresAt) : null },
    });
    res.status(201).json(item);
  } catch (error) {
    logger.error({ error }, 'Inventory create error');
    res.status(500).json({ error: 'Error al crear item' });
  }
});

inventoryRouter.put('/:id', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { name, description, category, quantity, minStock, price, supplier, batch, expiresAt } = req.body;
    const updated = await prisma.inventoryItem.update({
      where: { id_tenantId: { id: req.params.id, tenantId } },
      data: { name, description, category, quantity, minStock, price, supplier, batch, expiresAt: expiresAt ? new Date(expiresAt) : null },
    });
    res.json(updated);
  } catch (error) {
    logger.error({ error }, 'Inventory update error');
    res.status(500).json({ error: 'Error al actualizar item' });
  }
});

inventoryRouter.delete('/:id', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    await prisma.inventoryItem.delete({ where: { id_tenantId: { id: req.params.id, tenantId } } });
    res.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Inventory delete error');
    res.status(500).json({ error: 'Error al eliminar item' });
  }
});
