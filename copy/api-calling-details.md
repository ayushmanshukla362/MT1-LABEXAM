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

In EchoAPI, choose **Body -> raw -> JSON** and ensure the request has `Content-Type: application/json`. The body must include all four required fields: `taskName`, `assignedTo`, `status`, and `priority`. Omitting `priority` is the reason the API returns HTTP 400.

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
