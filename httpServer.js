import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const tasks = [
  { id: 1, taskName: 'Develop Login Page', assignedTo: 'Rahul Sharma', status: 'Pending', priority: 'High' },
  { id: 2, taskName: 'Write API Documentation', assignedTo: 'Amit Kumar', status: 'In Progress', priority: 'Medium' },
  { id: 3, taskName: 'Test User Flow', assignedTo: 'Neha Singh', status: 'Completed', priority: 'Low' }
];

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end('<h1>Welcome to the Employee Task Management Application</h1>');
    }
    if (req.method === 'GET' && url.pathname === '/tasks') return sendJson(res, 200, tasks);
    if (req.method === 'GET' && url.pathname === '/about') {
      return sendJson(res, 200, { application: 'Employee Task Management', technology: 'Node.js HTTP module', database: 'Not required' });
    }
    if (req.method === 'GET' && url.pathname === '/home') {
      const html = await readFile(join(__dirname, 'public', 'index.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    }
    if (req.method === 'POST' && url.pathname === '/add-task') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const task = JSON.parse(body);
          const required = ['id', 'taskName', 'assignedTo', 'status'];
          if (required.some(field => task[field] === undefined || task[field] === '')) return sendJson(res, 400, { error: 'id, taskName, assignedTo and status are required' });
          tasks.push(task);
          return sendJson(res, 201, { message: 'Task added successfully', task });
        } catch { return sendJson(res, 400, { error: 'Request body must be valid JSON' }); }
      });
      return;
    }
    return sendJson(res, 404, { error: 'Route not found' });
  } catch (error) {
    return sendJson(res, 500, { error: 'Internal server error', details: error.message });
  }
});

server.listen(PORT, () => console.log(`HTTP Server running at http://localhost:${PORT}`));
