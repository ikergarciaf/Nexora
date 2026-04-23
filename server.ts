import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES (Restoring SaaS Logic) ---
  
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", version: "1.0.0", environment: process.env.NODE_ENV });
  });

  // Authentication Middleware Mock (since we are reverting everything)
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    // In original SaaS, we'd verify JWT and set req.user
    req.user = { id: 'u1', tenantId: 't1', role: 'admin' };
    next();
  };

  // Dashboard Stats
  app.get("/api/dashboard/stats", authenticate, (req, res) => {
    res.json({
      monthlyRevenue: 12450.50,
      revenueGrowth: 12.5,
      appointmentsThisWeek: 42,
      activePatients: 156,
      noShowRate: 4.2,
      lastUpdated: new Date().toISOString()
    });
  });

  // Patients (Multi-tenant)
  app.get("/api/patients", authenticate, (req, res) => {
    res.json([
      { id: '1', fullName: 'Adrián Sánchez', email: 'adrian@example.com', phone: '600111222', tags: '["regular"]', tenantId: 't1' },
      { id: '2', fullName: 'Elena Martínez', email: 'elena@example.com', phone: '600333444', tags: '["vip"]', tenantId: 't1' },
      { id: '3', fullName: 'Roberto Gómez', email: 'roberto@example.com', phone: '600555666', tags: '["new"]', tenantId: 't1' }
    ]);
  });

  // Appointments (Multi-tenant)
  app.get("/api/appointments", authenticate, (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    res.json([
      { id: 'a1', patientName: 'Adrián Sánchez', type: 'Limpieza', startTime: '10:00', date: today, status: 'SCHEDULED', tenantId: 't1' },
      { id: 'a2', patientName: 'Elena Martínez', type: 'Revisión', startTime: '11:30', date: today, status: 'SCHEDULED', tenantId: 't1' }
    ]);
  });

  // AI Routes (Mocked as in original)
  app.post("/api/ai/summary", authenticate, (req, res) => {
    const { notes } = req.body;
    res.json({ 
      summary: `Resumen IA de Nexora: El paciente presenta evolución favorable. Se recomienda seguimiento en 6 meses. (Basado en: ${notes?.substring(0, 20)}...)` 
    });
  });

  app.post("/api/ai/whatsapp-draft", authenticate, (req, res) => {
    const { patientName, appointmentType, time } = req.body;
    res.json({ 
      draft: `Hola ${patientName}, recordatorio de tu cita de ${appointmentType} mañana a las ${time} en Nexora Clinic. ¿Confirmas tu asistencia?` 
    });
  });

  // --- VITE MIDDLEWARE ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
