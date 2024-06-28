import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import apicache from 'apicache';
import compression from 'compression';
import { body, param, validationResult } from 'express-validator';
import https from 'https';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;
const projectDir = process.env.PROJECT_DIR || 'C:\\projects\\otoh\\otoh';

const swaggerDocument = YAML.load(path.join(__dirname, 'openapi.yaml'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use(cors());
app.use(morgan('combined'));
app.use(helmet());
app.use(compression());

const cache = apicache.middleware;

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
};

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// List all files and directories
app.get('/api/files', cache('5 minutes'), (req, res, next) => {
  fs.readdir(projectDir, { withFileTypes: true }, (err, files) => {
    if (err) return next(err);
    res.json(files.map(file => file.name));
  });
});

// Read file content
app.get('/api/files/:filePath', [
  param('filePath').trim().escape()
], validateRequest, (req, res, next) => {
  const filePath = path.join(projectDir, req.params.filePath);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).send('File not found');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) return next(err);
      res.json({ content: data });
    });
  });
});

// Write to a file
app.put('/api/files/:filePath', [
  param('filePath').trim().escape(),
  body('content').isString()
], validateRequest, (req, res, next) => {
  console.log(`Writing to file: ${req.params.filePath}`);
  console.log(`Content: ${req.body.content}`);

  const filePath = path.join(projectDir, req.params.filePath);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).send('File not found');
    }
    fs.writeFile(filePath, req.body.content, 'utf8', err => {
      if (err) {
        console.error(`Error writing file: ${filePath}`);
        return next(err);
      }
      res.send('File written');
    });
  });
});

// Edit a file
app.patch('/api/files/:filePath', [
  param('filePath').trim().escape(),
  body('content').isString()
], validateRequest, (req, res, next) => {
  console.log(`Editing file: ${req.params.filePath}`);
  console.log(`Content: ${req.body.content}`);

  const filePath = path.join(projectDir, req.params.filePath);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).send('File not found');
    }
    fs.writeFile(filePath, req.body.content, 'utf8', err => {
      if (err) {
        console.error(`Error editing file: ${filePath}`);
        return next(err);
      }
      res.send('File edited');
    });
  });
});

// Batch operations
app.post('/api/files/batch', [
  body().isArray(),
  body('*.operation').isString(),
  body('*.filePath').isString(),
  body('*.content').optional().isString()
], validateRequest, (req, res, next) => {
  const operations = req.body;
  const results = [];

  operations.forEach(op => {
    const filePath = path.join(projectDir, op.filePath);

    switch (op.operation) {
      case 'edit':
        fs.access(filePath, fs.constants.F_OK, (err) => {
          if (err) {
            results.push({ filePath: op.filePath, status: 'File not found' });
          } else {
            fs.writeFile(filePath, op.content, 'utf8', err => {
              if (err) {
                results.push({ filePath: op.filePath, status: 'Error editing file' });
              } else {
                results.push({ filePath: op.filePath, status: 'File edited' });
              }
            });
          }
        });
        break;
      // Implement other operations (create, delete, etc.) as needed
      default:
        results.push({ filePath: op.filePath, status: 'Invalid operation' });
    }
  });

  res.json({ results });
});

// Create a new file
app.post('/api/files', [
  body('path').trim().escape(),
  body('content').isString()
], validateRequest, (req, res, next) => {
  const filePath = path.join(projectDir, req.body.path);
  fs.writeFile(filePath, req.body.content, 'utf8', err => {
    if (err) return next(err);
    res.status(201).send('File created');
  });
});

// Delete a file
app.delete('/api/files/:filePath', [
  param('filePath').trim().escape()
], validateRequest, (req, res, next) => {
  const filePath = path.join(projectDir, req.params.filePath);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).send('File not found');
    fs.unlink(filePath, err => {
      if (err) return next(err);
      res.status(204).send();
    });
  });
});

// Rename a file
app.put('/api/files/rename/:filePath', [
  param('filePath').trim().escape(),
  body('newPath').trim().escape()
], validateRequest, (req, res, next) => {
  const oldPath = path.join(projectDir, req.params.filePath);
  const newPath = path.join(projectDir, req.body.newPath);
  fs.access(oldPath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).send('File not found');
    fs.rename(oldPath, newPath, err => {
      if (err) return next(err);
      res.send('File renamed');
    });
  });
});

// Copy a file
app.post('/api/files/copy', [
  body('sourcePath').trim().escape(),
  body('destinationPath').trim().escape()
], validateRequest, (req, res, next) => {
  const sourcePath = path.join(projectDir, req.body.sourcePath);
  const destinationPath = path.join(projectDir, req.body.destinationPath);
  fs.access(sourcePath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).send('Source file not found');
    fs.copyFile(sourcePath, destinationPath, err => {
      if (err) return next(err);
      res.status(201).send('File copied');
    });
  });
});

// Create a new folder
app.post('/api/folders', [
  body('path').trim().escape()
], validateRequest, (req, res, next) => {
  const folderPath = path.join(projectDir, req.body.path);
  fs.mkdir(folderPath, { recursive: true }, err => {
    if (err) return next(err);
    res.status(201).send('Folder created');
  });
});

// Get contents of a folder
app.get('/api/folders/:folderPath', [
  param('folderPath').trim().escape()
], validateRequest, (req, res, next) => {
  const folderPath = path.join(projectDir, req.params.folderPath);
  fs.access(folderPath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).send('Folder not found');
    fs.readdir(folderPath, { withFileTypes: true }, (err, files) => {
      if (err) return next(err);
      res.json(files.map(file => file.name));
    });
  });
});

// Move a file or folder
app.put('/api/move', [
  body('oldPath').trim().escape(),
  body('newPath').trim().escape()
], validateRequest, (req, res, next) => {
  const oldPath = path.join(projectDir, req.body.oldPath);
  const newPath = path.join(projectDir, req.body.newPath);
  fs.access(oldPath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).send('Source file/folder not found');
    fs.rename(oldPath, newPath, err => {
      if (err) return next(err);
      res.send('Moved successfully');
    });
  });
});

app.use(errorHandler);

// HTTPS configuration
const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert'),
};

https.createServer(options, app).listen(port, () => {
  console.log(`API server running at https://localhost:${port}`);
});
