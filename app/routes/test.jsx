import React, { useState } from 'react';
import { Page, Card, FormLayout, TextField, Button } from '@shopify/polaris';

export default function Test() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    setResult(data.choices[0].text);
  };

  return (
    <Page title="Test OpenAI Integration">
      <Card sectioned>
        <form onSubmit={handleSubmit}>
          <FormLayout>
            <TextField
              label="Prompt"
              value={prompt}
              onChange={(value) => setPrompt(value)}
              placeholder="Enter prompt"
            />
            <Button primary submit>
              Generate
            </Button>
          </FormLayout>
        </form>
      </Card>
      {result && (
        <Card sectioned>
          <h2>Result:</h2>
          <p>{result}</p>
        </Card>
      )}
    </Page>
  );
}
