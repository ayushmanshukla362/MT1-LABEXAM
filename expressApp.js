import express from 'express';

const app = express();
const PORT = 4000;
// EchoAPI's raw JSON body should be sent as application/json. Accepting text/plain
// as well makes the API tolerant of EchoAPI requests whose content type is not set.
app.use(express.json({ type: ['application/json', 'application/*+json', 'text/plain'] }));

let tasks = [
  { id: 1, taskName: 'Develop Login Page', assignedTo: 'Rahul Sharma', status: 'Pending', priority: 'High' },
  { id: 2, taskName: 'Write API Documentation', assignedTo: 'Amit Kumar', status: 'In Progress', priority: 'Medium' },
  { id: 3, taskName: 'Test User Flow', assignedTo: 'Neha Singh', status: 'Completed', priority: 'Low' }
];

const requiredFields = ['taskName', 'assignedTo', 'status', 'priority'];
const validateTask = body => requiredFields.every(field => body?.[field] !== undefined && body[field] !== '');

app.get('/tasks', (_req, res) => res.json(tasks));

app.get('/tasks/:id', (req, res) => {
  const task = tasks.find(item => item.id === Number(req.params.id));
  return task ? res.json(task) : res.status(404).json({ error: 'Task not found' });
});

app.post('/tasks', (req, res) => {
  if (!validateTask(req.body)) return res.status(400).json({ error: 'taskName, assignedTo, status and priority are required' });
  const task = { id: tasks.length ? Math.max(...tasks.map(item => item.id)) + 1 : 1, ...req.body };
  tasks.push(task);
  return res.status(201).json({ message: 'Task added successfully', task });
});

app.put('/tasks/:id', (req, res) => {
  const index = tasks.findIndex(item => item.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  if (!validateTask(req.body)) return res.status(400).json({ error: 'taskName, assignedTo, status and priority are required' });
  tasks[index] = { id: tasks[index].id, ...req.body };
  return res.json({ message: 'Task updated successfully', task: tasks[index] });
});

app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex(item => item.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  const [deleted] = tasks.splice(index, 1);
  return res.json({ message: 'Task deleted successfully', task: deleted });
});

app.use((error, _req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON' });
  }
  return next(error);
});

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.listen(PORT, () => console.log(`Express Server running at http://localhost:${PORT}`));
