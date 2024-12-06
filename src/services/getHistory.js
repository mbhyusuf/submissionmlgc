const { Firestore } = require('@google-cloud/firestore');

async function getPredictHistories() {
    const db = new Firestore({
        projectId: process.env.PROJECT_ID, 
        keyFilename: process.env.SERVICE_KEY_JSON
    });
    
    const predictCollection = db.collection('predictions');

    try {
        const snapshot = await predictCollection.get();

        if (snapshot.empty) {
            console.log('No matching documents.');
            return [];
        }

        const histories = snapshot.docs.map(doc => ({
            id: doc.id,
            history: { ...doc.data() }
        }));

        return histories;
    } catch (error) {
        console.error('Error retrieving prediction histories:', error);
        throw error;
    }
}
 
module.exports = getPredictHistories;