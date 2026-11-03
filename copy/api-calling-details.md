# API Calling Details

## Part B - Express API

Base URL: `http://localhost:4000`

| Method | Endpoint | Success status | Actual behavior |
| --- | --- | ---: | --- |
| GET | `/tasks` | 200 | Returns the complete in-memory task array |
| GET | `/tasks/1` | 200 | Returns task ID 1; returns 404 if it does not exist |
| POST | `/tasks` | 201 | Creates a task; preserves a supplied numeric `id`, otherwise generates the next numeric ID |
| PUT | `/tasks/1` | 200 | Replaces task 1 details; returns 404 if task 1 does not exist |
| DELETE | `/tasks/1` | 200 | Removes task 1 and returns the deleted task |

All request bodies must be JSON. In EchoAPI, choose **Body -> raw -> JSON** and ensure the request has `Content-Type: application/json`. The Express parser also accepts raw JSON sent as `text/plain` for EchoAPI compatibility.

## POST `/tasks`

Required fields: `taskName`, `assignedTo`, `status`, and `priority`. The paper's sample includes `id: 4`; the current implementation preserves a supplied `id`, and generates the next numeric ID when `id` is omitted.

```json
{
  "taskName": "Develop REST API",
  "assignedTo": "Amit Kumar",
  "status": "Pending",
  "priority": "Medium"
}
```

Success response: HTTP `201`

```json
{
  "message": "Task added successfully",
  "task": {
    "id": 4,
    "taskName": "Develop REST API",
    "assignedTo": "Amit Kumar",
    "status": "Pending",
    "priority": "Medium"
  }
}
```

## PUT `/tasks/1`

```json
{
  "taskName": "Develop Login Page",
  "assignedTo": "Rahul Sharma",
  "status": "Completed",
  "priority": "High"
}
```

Success response: HTTP `200`. A `404` means task ID 1 is not present in the current in-memory array; restart `node expressApp.js` to restore the three sample tasks.

## Error behavior

- Missing required fields: HTTP `400` with a JSON validation error.
- Invalid JSON: HTTP `400` with `{"error":"Request body must be valid JSON"}`.
- Unknown task ID: HTTP `404` with `{"error":"Task not found"}`.
- Unknown route: HTTP `404` with `{"error":"Route not found"}`.

## Part A - HTTP module

Base URL: `http://localhost:3000`

| Method | Endpoint | Behavior |
| --- | --- | --- |
| GET | `/` | Welcome HTML response |
| GET | `/tasks` | Employee tasks as JSON |
| GET | `/about` | Application information as JSON |
| GET | `/home` | `public/index.html` served using the FS module |
| POST | `/add-task` | Adds a JSON task; requires `id`, `taskName`, `assignedTo`, and `status` |
