# CodeCraftHub

CodeCraftHub is a lightweight course tracker built with Spring Boot and plain HTML, CSS, and JavaScript. Use the dashboard to keep track of courses, target completion dates, and learning progress.

## Features

- View all courses and summary counts
- Search courses and filter by status
- Add, edit, and delete courses
- Persist course data in a local JSON file
- Responsive dashboard with no frontend framework

## Requirements

- Java 17 or later
- Maven (or the included Maven wrapper)

## Run the application

From the project root, start Spring Boot with the Maven wrapper:

```powershell
.\mvnw.cmd spring-boot:run
```

Then open [http://localhost:8080](http://localhost:8080). The frontend is served from `src/main/resources/static`.

Course data is stored in `data/courses.json`, relative to the application's working directory. The file is created automatically when the application starts.

## Course API

The REST API is available at `/api/courses`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/courses` | List all courses |
| `GET` | `/api/courses?status=IN_PROGRESS` | List courses with a given status |
| `GET` | `/api/courses/{id}` | Get a course |
| `POST` | `/api/courses` | Create a course |
| `PUT` | `/api/courses/{id}` | Replace a course |
| `PATCH` | `/api/courses/{id}/status` | Update a course's status |
| `DELETE` | `/api/courses/{id}` | Delete a course |

Course request and response bodies use JSON:

```json
{
  "name": "Learning Java",
  "description": "A practical introduction to Java",
  "targetCompletionDate": "2026-12-31",
  "status": "IN_PROGRESS"
}
```

`name`, `targetCompletionDate`, and `status` are required. Status must be one of `NOT_STARTED`, `IN_PROGRESS`, or `COMPLETED`. New courses default to `NOT_STARTED` if the API request omits a status.

## Run tests

```powershell
.\mvnw.cmd test
```