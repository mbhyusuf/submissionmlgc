const tf = require('@tensorflow/tfjs-node');
 
async function predictClassification(model, image) {
    const tensor = tf.node
    .decodeJpeg(image)
    .resizeNearestNeighbor([224, 224])
    .expandDims()
    .toFloat()
 
    const prediction = model.predict(tensor);
    const score = await prediction.data();
    const confidenceScore = Math.max(...score) * 100;

    const classes = ['Cancer', 'Non-cancer'];
 
    const classResult = confidenceScore >= 0.50 ? 0 : 1;
    const label = classes[classResult];

    let suggestion;
 
    if (label === 'Cancer') {
        suggestion = "Segera periksa ke dokter!"
    }
    
    if (label === 'Non-cancer') {
        suggestion = "Penyakit kanker tidak terdeteksi."
    }

    return { label, suggestion };
}

module.exports = predictClassification;