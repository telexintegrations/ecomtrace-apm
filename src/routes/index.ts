import express from 'express';
import axios from 'axios';
import config from '../config/env';
import logger from '../config/logger';

const router = express.Router();

router.get('/', (req, res) => {
	res.send('Hello World!');
});

router.get('/integration.json', (req, res) => {
	const baseUrl = `${req.protocol}://${req.get('host')}`;

	res.status(200).json({
		data: {
			date: {
				created_at: '2025-02-18',
				updated_at: '2025-02-18',
			},
			descriptions: {
				app_name: 'EcomTrace APM',
				app_description:
					'Performance Monitoring (Speed), Real-time error tracing, Session replay, & Custom metrics (Most active store, active users)',
				app_logo: 'https://i.ibb.co/nqPvcDbk/Ecom-Trace.png',
				app_url: baseUrl,
				background_color: '#fff',
			},
			is_active: true,
			integration_type: 'output',
			key_features: [
				'- Logs payloads for errors, speed monitoring and ecommerce insights to ecomtrace.site',
			],
			integration_category: 'E-commerce & Retail',
			author: 'Onesi Ukanah',
			website: config.apmWebsiteUrl,
			settings: [
				{
					label: 'forward-type',
					type: 'dropdown',
					options: ['error-tracing', 'speed-monitoring', 'session-replay'],
					default: 'error-tracing',
					required: true,
				},
			],
			tick_target: `${baseUrl}/target_url`,
		},
	});
});

interface ErrorTracingDto {
	message?: string;
	settings?: { label?: string; default?: string }[];
}

router.post('/target_url', async (req, res) => {
	const { message, settings } = req.body as ErrorTracingDto;
	const repeater_type = settings?.filter(
		(setting) => setting.label === 'forward-type'
	)?.[0].default;

	if (!repeater_type) {
		res.status(400).json({
			error: 'forward-type setting is required',
		});
		return;
	}

	const webhookUrl = `${config.apmWebsiteApiUrl}/receive-repeater?forward_type=${repeater_type}`;

	try {
		const response = await axios.post(
			webhookUrl,
			{
				message,
			},
			{
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);

		res.status(200).json({ status: 'success', webhookResponse: response.data });
	} catch (error) {
		logger.error('Failed to send webhook:', (error as Error).message);
		res.status(500).json({ error: 'Failed to send webhook' });
	}
});

export default router;
