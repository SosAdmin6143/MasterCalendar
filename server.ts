import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import pg from 'pg';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { SharedCalendar, CalendarEvent, EventGroup } from './src/types/calendar';
import { generateICSFeed } from './src/utils/icsGenerator';

dotenv.config();

const { Pool } = pg;
let dbPool: pg.Pool | null = null;

if (process.env.DATABASE_URL) {
  console.log('🔌 Connecting to PostgreSQL database...');
  dbPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
  });
}

// Initial default calendar with vibrant color groups
const defaultGroups: EventGroup[] = [
  {
    id: 'grp-1',
    name: '🚀 Product & Releases',
    description: 'Sprint milestones, release dates, and product launches',
    color: '#8B5CF6', // Purple
    textColor: '#FFFFFF',
    outlookCategory: 'Purple Category',
    icon: 'rocket'
  },
  {
    id: 'grp-2',
    name: '💼 Executive & Strategy',
    description: 'Leadership syncs, board meetings, and strategy reviews',
    color: '#0284C7', // Sky Blue
    textColor: '#FFFFFF',
    outlookCategory: 'Blue Category',
    icon: 'briefcase'
  },
  {
    id: 'grp-3',
    name: '🚨 On-Call & Incident Ops',
    description: 'Engineer on-call shifts, maintenance windows, and incident response',
    color: '#EF4444', // Red
    textColor: '#FFFFFF',
    outlookCategory: 'Red Category',
    icon: 'siren'
  },
  {
    id: 'grp-4',
    name: '🎉 Team Social & Culture',
    description: 'Team lunches, happy hours, birthdays, and celebrations',
    color: '#10B981', // Emerald Green
    textColor: '#FFFFFF',
    outlookCategory: 'Green Category',
    icon: 'party'
  },
  {
    id: 'grp-5',
    name: '🎨 Design & User Research',
    description: 'Design crits, UX testing sessions, and wireframe reviews',
    color: '#F59E0B', // Amber / Orange
    textColor: '#FFFFFF',
    outlookCategory: 'Orange Category',
    icon: 'palette'
  },
  {
    id: 'grp-6',
    name: '📚 Training & Workshops',
    description: 'Tech talks, onboarding, skill shares, and seminars',
    color: '#EC4899', // Pink / Rose
    textColor: '#FFFFFF',
    outlookCategory: 'Magenta Category',
    icon: 'book'
  }
];

// Helper to create date relative to today
const getRelativeDate = (dayOffset: number, hour: number, minute: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const defaultEvents: CalendarEvent[] = [
  {
    id: 'evt-1',
    calendarId: 'cal-default',
    groupId: 'grp-1',
    title: 'v2.4 Production Release Window',
    description: 'Deploying v2.4 updates to global clusters. Smoke testing & rollouts.',
    location: 'Production Deployment Dashboard',
    start: getRelativeDate(1, 9, 0),
    end: getRelativeDate(1, 11, 0),
    isAllDay: false,
    organizer: 'Release Manager <releases@company.com>',
    attendees: ['engineering@company.com', 'qa@company.com'],
    resources: ['K8s Release Console', 'Release Runbook Doc', 'DevOps Call Phone'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'evt-2',
    calendarId: 'cal-default',
    groupId: 'grp-2',
    title: 'Q3 Leadership All-Hands',
    description: 'Quarterly roadmap review, financial metrics, and Q4 strategic goals.',
    location: 'Main Auditorium & Microsoft Teams',
    start: getRelativeDate(2, 14, 0),
    end: getRelativeDate(2, 15, 30),
    isAllDay: false,
    organizer: 'Sarah Jenkins <sjenkins@company.com>',
    attendees: ['all-hands@company.com'],
    resources: ['Main Auditorium AV System', 'Wireless Mics (x2)', 'HDMI Presentation Cart', 'Livestream Recording Rig'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'evt-3',
    calendarId: 'cal-default',
    groupId: 'grp-3',
    title: 'Primary On-Call Shift: Alex Rivera',
    description: 'Alex Rivera primary on-call engineer for Tier-1 infrastructure services.',
    location: 'PagerDuty / Slack #ops-alerts',
    start: getRelativeDate(0, 0, 0),
    end: getRelativeDate(3, 23, 59),
    isAllDay: true,
    organizer: 'DevOps Lead <devops@company.com>',
    attendees: ['arivera@company.com'],
    resources: ['PagerDuty Escalation Laptop', 'Emergency Satellite Phone'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'evt-4',
    calendarId: 'cal-default',
    groupId: 'grp-4',
    title: 'Friday Team Celebration & Coffee',
    description: 'Join us in the lounge for fresh espresso and pastries to celebrate sprint milestones!',
    location: '4th Floor Tech Hub Lounge',
    start: getRelativeDate(3, 10, 0),
    end: getRelativeDate(3, 11, 0),
    isAllDay: false,
    organizer: 'Culture Squad <culture@company.com>',
    resources: ['Commercial Espresso Machine', 'Lounge Sound System', 'Pastry Catering Trays'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'evt-5',
    calendarId: 'cal-default',
    groupId: 'grp-5',
    title: 'UI Design System critique',
    description: 'Reviewing component updates for dark theme, typography, and Outlook color mapping.',
    location: 'Figma Meeting Room 3A',
    start: getRelativeDate(-1, 13, 0),
    end: getRelativeDate(-1, 14, 0),
    isAllDay: false,
    organizer: 'David Kim <dkim@company.com>',
    resources: ['Figma Design Spec Board', '4K Color Spectrum Display'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'evt-6',
    calendarId: 'cal-default',
    groupId: 'grp-6',
    title: 'Workshop: Microsoft Outlook iCal Integration Best Practices',
    description: 'Learn how to publish, subscribe, and map Outlook event categories with custom hex colors.',
    location: 'Training Room B & Webex',
    start: getRelativeDate(4, 15, 0),
    end: getRelativeDate(4, 16, 30),
    isAllDay: false,
    organizer: 'IT Enablement <it@company.com>',
    resources: ['Training Room B Projector', '20x Participant Laptops', 'Webex Audio Pod'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const calendarsStore: Map<string, SharedCalendar> = new Map();

calendarsStore.set('cal-default', {
  id: 'cal-default',
  name: 'Master Calendar',
  description: 'Shared cross-departmental calendar with color-coded event groups for Outlook & Apple Calendar.',
  timeZone: 'America/New_York',
  ownerName: 'Sissines Corporate IT',
  groups: defaultGroups,
  events: defaultEvents,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

async function initDb() {
  if (!dbPool) return;
  try {
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS calendars (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ PostgreSQL "calendars" table initialized.');

    const res = await dbPool.query('SELECT id, data FROM calendars');
    if (res.rows.length > 0) {
      for (const row of res.rows) {
        calendarsStore.set(row.id, row.data as SharedCalendar);
      }
      console.log(`📦 Loaded ${res.rows.length} calendar(s) from PostgreSQL.`);
    } else {
      const defaultCal = calendarsStore.get('cal-default');
      if (defaultCal) {
        await saveCalendarToDb(defaultCal);
        console.log('🌱 Seeded default Master Calendar into PostgreSQL.');
      }
    }
  } catch (err) {
    console.error('❌ Error initializing PostgreSQL database:', err);
  }
}

async function saveCalendarToDb(cal: SharedCalendar) {
  if (!dbPool) return;
  try {
    await dbPool.query(
      `INSERT INTO calendars (id, data, updated_at) 
       VALUES ($1, $2, NOW()) 
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()`,
      [cal.id, JSON.stringify(cal)]
    );
  } catch (err) {
    console.error(`❌ Failed to persist calendar ${cal.id} to PostgreSQL:`, err);
  }
}

async function deleteCalendarFromDb(id: string) {
  if (!dbPool) return;
  try {
    await dbPool.query('DELETE FROM calendars WHERE id = $1', [id]);
  } catch (err) {
    console.error(`❌ Failed to delete calendar ${id} from PostgreSQL:`, err);
  }
}

// Initialize Gemini API Client
const aiApiKey = process.env.GEMINI_API_KEY || '';
const aiClient = aiApiKey ? new GoogleGenAI({ apiKey: aiApiKey }) : null;

async function startServer() {
  await initDb();

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS headers for iCal feeds and web clients
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // --- API ENDPOINTS ---

  // Get all calendars
  app.get('/api/calendars', async (req, res) => {
    if (dbPool) {
      try {
        const result = await dbPool.query('SELECT data FROM calendars');
        const list = result.rows.map(row => row.data as SharedCalendar);
        list.forEach(cal => calendarsStore.set(cal.id, cal)); // sync cache
        return res.json(list);
      } catch (err) {
        console.error('Failed to fetch calendars from DB:', err);
      }
    }
    const list = Array.from(calendarsStore.values());
    res.json(list);
  });

  // Get single calendar
  app.get('/api/calendars/:id', async (req, res) => {
    if (dbPool) {
      try {
        const result = await dbPool.query('SELECT data FROM calendars WHERE id = $1', [req.params.id]);
        if (result.rows.length > 0) {
          const cal = result.rows[0].data as SharedCalendar;
          calendarsStore.set(cal.id, cal); // sync cache
          return res.json(cal);
        }
      } catch (err) {
        console.error('Failed to fetch single calendar from DB:', err);
      }
    }
    const cal = calendarsStore.get(req.params.id);
    if (!cal) {
      return res.status(404).json({ error: 'Calendar not found' });
    }
    res.json(cal);
  });

  // Create new calendar
  app.post('/api/calendars', async (req, res) => {
    const { name, description, timeZone, ownerName } = req.body;
    const newId = 'cal-' + Date.now().toString(36);
    const newCal: SharedCalendar = {
      id: newId,
      name: name || 'New Shared Calendar',
      description: description || '',
      timeZone: timeZone || 'America/New_York',
      ownerName: ownerName || 'Team Member',
      groups: [...defaultGroups],
      events: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    calendarsStore.set(newId, newCal);
    await saveCalendarToDb(newCal);
    res.status(201).json(newCal);
  });

  // Update calendar details / events / groups
  app.put('/api/calendars/:id', async (req, res) => {
    const cal = calendarsStore.get(req.params.id);
    if (!cal) {
      return res.status(404).json({ error: 'Calendar not found' });
    }

    const { name, description, timeZone, groups, events } = req.body;
    if (name !== undefined) cal.name = name;
    if (description !== undefined) cal.description = description;
    if (timeZone !== undefined) cal.timeZone = timeZone;
    if (groups !== undefined) cal.groups = groups;
    if (events !== undefined) cal.events = events;
    cal.updatedAt = new Date().toISOString();

    calendarsStore.set(cal.id, cal);
    await saveCalendarToDb(cal);
    res.json(cal);
  });

  // Delete calendar
  app.delete('/api/calendars/:id', async (req, res) => {
    if (req.params.id === 'cal-default') {
      return res.status(400).json({ error: 'Cannot delete default calendar' });
    }
    calendarsStore.delete(req.params.id);
    await deleteCalendarFromDb(req.params.id);
    res.json({ success: true });
  });

  // --- CRITICAL OUTLOOK ICAL / WEBCAL FEED ENDPOINTS ---
  
  // Full calendar feed (.ics or webcal)
  const serveICal = async (req: express.Request, res: express.Response, calId: string, groupId?: string) => {
    let cal = calendarsStore.get(calId);
    
    if (dbPool) {
      try {
        const result = await dbPool.query('SELECT data FROM calendars WHERE id = $1', [calId]);
        if (result.rows.length > 0) {
          cal = result.rows[0].data as SharedCalendar;
          calendarsStore.set(cal.id, cal);
        }
      } catch (err) {
        console.error('Failed to fetch calendar from DB for ICS feed:', err);
      }
    }

    if (!cal) {
      return res.status(404).send('Calendar not found');
    }

    const host = req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const appUrl = `${protocol}://${host}`;

    const icsContent = generateICSFeed(cal, groupId, appUrl);

    // Set headers required for Outlook subscription feeds
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="${cal.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.ics"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.send(icsContent);
  };

  // Main feed routes (.ics extension or feed parameter)
  app.get('/api/calendar/:calId/feed.ics', (req, res) => serveICal(req, res, req.params.calId));
  app.get('/api/calendar/:calId.ics', (req, res) => serveICal(req, res, req.params.calId));
  app.get('/api/calendar/:calId/group/:groupId/feed.ics', (req, res) => serveICal(req, res, req.params.calId, req.params.groupId));

  // --- AI EVENT CREATION / PARSER VIA GEMINI ---
  app.post('/api/ai/parse-events', async (req, res) => {
    try {
      const { prompt, calendarId } = req.body;
      const cal = calendarsStore.get(calendarId || 'cal-default') || Array.from(calendarsStore.values())[0];

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt string is required' });
      }

      if (!aiClient) {
        return res.status(500).json({ error: 'Gemini API key is not configured' });
      }

      const groupsDescription = cal.groups
        .map((g) => `- Group ID: "${g.id}", Name: "${g.name}", Color: "${g.color}", Description: "${g.description || ''}"`)
        .join('\n');

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Today is ${new Date().toISOString()}.
You are an expert AI Calendar Assistant. Given the user's natural language request, extract structured event details and match each event to the most appropriate Group ID from the available groups listed below.

AVAILABLE EVENT GROUPS:
${groupsDescription}

USER PROMPT:
"${prompt}"

Instructions:
1. Extract event title, start date/time (ISO 8601 string in local/UTC), end date/time, location, description, and attendees.
2. If start/end times aren't specified, pick sensible defaults (e.g. 1 hour duration, or set isAllDay: true).
3. Choose the single best groupId from the available groups. If none matches, pick the first group.
4. Return a clean array of structured events.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                location: { type: Type.STRING },
                start: { type: Type.STRING, description: 'ISO 8601 date string' },
                end: { type: Type.STRING, description: 'ISO 8601 date string' },
                isAllDay: { type: Type.BOOLEAN },
                groupId: { type: Type.STRING },
                attendees: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                recurrence: { type: Type.STRING, enum: ['none', 'daily', 'weekly', 'biweekly', 'monthly'] }
              },
              required: ['title', 'start', 'end', 'groupId']
            }
          }
        }
      });

      const parsedEvents = JSON.parse(response.text || '[]');
      res.json({ events: parsedEvents });
    } catch (err: any) {
      console.error('Error parsing events with Gemini:', err);
      res.status(500).json({ error: err.message || 'Failed to parse events' });
    }
  });

  // --- VITE OR STATIC SERVING ---
  const distIndex = path.join(process.cwd(), 'dist', 'index.html');
  if (process.env.NODE_ENV === 'production' || fs.existsSync(distIndex)) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(distIndex);
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ColorCal Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
