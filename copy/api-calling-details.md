# API Calling Details

Base URL: `http://localhost:4000`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/tasks` | List all tasks |
| GET | `/tasks/1` | Get task with ID 1 |
| POST | `/tasks` | Add a task |
| PUT | `/tasks/1` | Update task 1 |
| DELETE | `/tasks/1` | Delete task 1 |

## POST body (EchoAPI: Body -> raw -> JSON)

```json
{
  "taskName": "Develop REST API",
  "assignedTo": "Amit Kumar",
  "status": "Pending",
  "priority": "Medium"
}
```

## PUT body

```json
{
  "taskName": "Develop Login Page",
  "assignedTo": "Rahul Sharma",
  "status": "Completed",
  "priority": "High"
}
```

The HTTP-module server is tested separately at port 3000 using `/`, `/tasks`, `/about`, `/home`, and `POST /add-task`.
