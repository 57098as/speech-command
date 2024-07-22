const express = require('express');
const cors = require('cors');
const fetch = require("node-fetch");
const tf = require('@tensorflow/tfjs');
const speechCommands = require('@tensorflow-models/speech-commands');
const bodyParser = require('body-parser');
global.fetch = fetch;

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.raw({ type: 'audio/wav', limit: '50mb' }));

let recognizer;

const loadModels = async () => {
    try {
        recognizer = await speechCommands.create('BROWSER_FFT');
        await recognizer.ensureModelLoaded();

        console.log("Model loaded");
    } catch (err) {
        console.log('Failed to load model', err.message);
    }
};

const processAudioData = async (req, res) => {
    try {
        const audioBuffer = req.body;
        const audioData = new Float32Array(audioBuffer);
        console.log(audioBuffer);

        // Ensure recognizer is loaded
        if (!recognizer) {
            return res.status(500).json({ error: 'Speech recognition model not loaded.' });
        }
        // Example inference with the loaded model
        const result = await recognizer.recognize(audioBuffer);

        console.log("Recognition result:", result);
        res.status(200).json({ result });
    } catch (error) {
        console.error('Error processing audio:', error);
        res.status(500).json({ error: 'Failed to process audio' });
    }
};

app.get('/', (req, res) => {
    res.send("Hello world");
})
app.post('/process-audio', processAudioData);

loadModels().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    });
}).catch((err) => {
    console.log("Failed to start server: ", err);
    process.exit(1); // Exit with non-zero status to indicate failure
});