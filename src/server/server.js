require('dotenv').config();
const Hapi = require('@hapi/hapi');
const loadModel = require('../services/loadModel');
const routes = require('./routes');
const admin = require('firebase-admin');

(async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
        routes: {
            cors: {
              origin: ['*'],
            },
        },
    })

    const model = await loadModel();
    server.app.model = model;

    admin.initializeApp();

    const dbadmin = admin.firestore();
    dbadmin.settings({
        ignoreUndefinedProperties: true
    });

    server.route(routes);

    server.ext('onPreResponse', function (request, h) {
        const response = request.response;
        if(response.output){
            if (response.output.payload.message.includes('content length greater than maximum allowed')) {
                const newResponse = h.response({
                    status: 'fail',
                    message: 'Payload content length greater than maximum allowed: 1000000'
                })
                newResponse.code(response.output.statusCode);
                return newResponse;
            }
        }
        if(response.source) {
            if(response.source.message){
                if (response.source.message.includes('The shape of')) {
                    const newResponse = h.response({
                        status: 'fail',
                        message: 'Terjadi kesalahan dalam melakukan prediksi'
                    })
                    newResponse.code(400);
                    return newResponse;
                }
            }
        }
        return h.continue;
    });

    await server.start();
    console.log(`Server start at: ${server.info.uri}`);
})();