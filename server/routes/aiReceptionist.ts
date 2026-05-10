import { Router } from 'express';
import prisma from '../db.ts';
import logger from '../services/logger.ts';

export const aiReceptionistRouter = Router();

aiReceptionistRouter.post('/interpret', async (req, res) => {
  try {
    const { message, tenantId } = req.body;
    if (!message || !tenantId) return res.status(400).json({ error: 'Faltan datos' });

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true, specialty: true } });
    if (!tenant) return res.status(404).json({ error: 'Clínica no encontrada' });

    const lower = message.toLowerCase();

    if (lower.includes('agendar') || lower.includes('reservar') || lower.includes('cita') || lower.includes('hora')) {
      const today = new Date();
      const dayStart = new Date(today); dayStart.setHours(9, 0, 0, 0);
      const dayEnd = new Date(today); dayEnd.setHours(20, 0, 0, 0);
      if (dayStart < new Date()) dayStart.setTime(Date.now() + 3600000);

      const appointments = await prisma.appointment.findMany({
        where: { tenantId, startTime: { gte: dayStart, lt: dayEnd }, status: { not: 'CANCELLED' } },
        select: { startTime: true, endTime: true },
      });

      const slots = [];
      let cursor = new Date(dayStart);
      while (cursor < dayEnd) {
        const slotEnd = new Date(cursor.getTime() + 30 * 60000);
        const conflicted = appointments.some(a => cursor < a.endTime && slotEnd > a.startTime);
        if (!conflicted) slots.push(cursor.toISOString());
        cursor = slotEnd;
      }

      if (slots.length === 0) {
        return res.json({ response: `Lo siento, no tengo horarios disponibles hoy en ${tenant.name}. ¿Quieres que busque para otro día?`, action: 'ask_date', slots: [] });
      }

      return res.json({
        response: `Claro, en ${tenant.name} tengo estos horarios disponibles hoy: ${slots.slice(0, 5).map(s => new Date(s).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })).join(', ')}${slots.length > 5 ? ` y ${slots.length - 5} más` : ''}. ¿Qué hora prefieres?`,
        action: 'show_slots',
        slots: slots.slice(0, 10),
      });
    }

    if (lower.includes('horario') || lower.includes('abierto') || lower.includes('atención')) {
      return res.json({ response: `${tenant.name} atiende de Lunes a Viernes de 9:00 a 20:00, y Sábados de 10:00 a 14:00. ¿Te gustaría agendar una cita?`, action: 'info' });
    }

    if (lower.includes('precio') || lower.includes('costo') || lower.includes('cuánto') || lower.includes('tarifa')) {
      const treatments = await prisma.treatment.findMany({ where: { tenantId }, take: 5, select: { name: true, price: true } });
      const priceList = treatments.map(t => `${t.name}: ${t.price}€`).join(', ');
      return res.json({ response: `Los precios en ${tenant.name} son: ${priceList || 'consulta en la clínica para más detalles'}. ¿Te gustaría agendar una cita?`, action: 'info' });
    }

    if (lower.includes('gracias') || lower.includes('ayuda') || lower.includes('info')) {
      return res.json({ response: `¡De nada! Soy el asistente AI de ${tenant.name}. Puedo ayudarte a agendar citas, consultar horarios o precios. ¿En qué más puedo ayudarte?`, action: 'info' });
    }

    return res.json({ response: `Hola, soy el asistente AI de ${tenant.name}. Puedo ayudarte a agendar citas, consultar horarios o precios. ¿Qué te gustaría hacer?`, action: 'greeting' });
  } catch (error) {
    logger.error({ error }, 'AI Receptionist error');
    res.status(500).json({ error: 'Error del asistente' });
  }
});
