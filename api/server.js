require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initDb = require('./src/initDb');
const { seedAppDefaults } = require('./src/seed');

const app = express();

const origins = (process.env.ALLOWED_ORIGINS || '')
	.split(',')
	.map((s) => s.trim())
	.filter(Boolean);
app.use(cors({ origin: origins.length ? origins : '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(require('./src/middleware/camelCase'));

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/transactions', require('./src/routes/transactions'));
app.use('/api/categories', require('./src/routes/categories'));
app.use('/api/budget', require('./src/routes/budget'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api', require('./src/routes/exportImport'));
app.use('/api/site-settings', require('./src/routes/siteSettings'));

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5197;

(async () => {
	try {
		await initDb();
		await seedAppDefaults();
		app.listen(PORT, () => console.log(`API running on port ${PORT}`));
	} catch (err) {
		console.error('Startup failed:', err);
		process.exit(1);
	}
})();
