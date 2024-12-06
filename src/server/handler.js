const predictClassification = require('../services/inferenceService');
const storeData = require('../services/storeData');
const getPredictHistories = require('../services/getHistory');
const crypto = require('crypto');

async function postPredictHandler(request, h) {
	const { image } = request.payload;
	const { model } = request.server.app;

	if (image.bytes > 1 * 1024 * 1024) {
		return h.response({
			status: 'fail',
			message: 'Payload content length greater than maximum allowed: 1000000',
			error: true
		}).code(413);
	}

	try {
		const { label, suggestion } = await predictClassification(model, image);
		const id = crypto.randomUUID();
		const createdAt = new Date().toISOString();

		const data = {
			"id": id,
			"result": label,
			"suggestion": suggestion,
			"createdAt": createdAt
		}

		await storeData(id, data);

		const response = h.response({
			status: 'success',
			message: 'Model is predicted successfully',
			data
		})
		response.code(201);
		return response;
	} catch (error) {
		return h.response({
			status: 'fail',
			message: `${error.message}`,
			error: true
		}).code(400);
	}
}

async function getPredictHistoriesHandler(request, h) {
	const history = await getPredictHistories();
	const response = h.response({
		status: 'success',
		data: history
	})
	response.code(200);
	return response;
}

module.exports = {
	postPredictHandler,
	getPredictHistoriesHandler
};