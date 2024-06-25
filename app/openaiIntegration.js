import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { Configuration, OpenAIApi } from 'openai';

// Create a new Express router
const router = Router();

// Configure OpenAI API
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

router.use(express.json());

// Endpoint to read a file
router.get('/read-file', (req, res) => {
  const filePath = path.join(process.cwd(), req.query.file);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send(err.toString());
    }
    res.send(data);
  });
});

// Endpoint to write to a file
router.post('/write-file', (req, res) => {
  const filePath = path.join(process.cwd(), req.body.file);
  const content = req.body.content;
  fs.writeFile(filePath, content, (err) => {
    if (err) {
      return res.status(500).send(err.toString());
    }
    res.send('File written successfully');
  });
});

// Endpoint to interact with OpenAI API
router.post('/ask-chatgpt', async (req, res) => {
  const prompt = req.body.prompt;
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 150,
    });
    res.send(response.data.choices[0].text);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// Endpoint to read a file with ChatGPT
router.post('/read-with-chatgpt', async (req, res) => {
  const filePath = path.join(process.cwd(), req.body.file);
  fs.readFile(filePath, 'utf8', async (err, data) => {
    if (err) {
      return res.status(500).send(err.toString());
    }

    const gptResponse = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `Analyze this content: ${data}`,
      max_tokens: 150,
    });

    res.send({ fileContent: data, analysis: gptResponse.data.choices[0].text });
  });
});

// Endpoint to write a file with ChatGPT
router.post('/write-with-chatgpt', async (req, res) => {
  const filePath = path.join(process.cwd(), req.body.file);
  const prompt = req.body.prompt;

  try {
    const gptResponse = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 150,
    });

    const content = gptResponse.data.choices[0].text;

    fs.writeFile(filePath, content, (err) => {
      if (err) {
        return res.status(500).send(err.toString());
      }
      res.send('File written successfully with content from ChatGPT');
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

export default router;
