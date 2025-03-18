# Todo Application

This is a complete Todo Application with:

- MySQL database for data storage
- Node.js Express backend API
- React frontend with a clean UI

## Architecture

- **Frontend**: React application served by Nginx
- **Backend**: Node.js Express REST API
- **Database**: MySQL

## Deployment Instructions with Docker Compose

### Prerequisites
- Docker and Docker Compose installed on your system

### Running the Application

1. Clone this repository
2. From the project root directory, run:

```bash
docker-compose up -d
```

3. Access the application at http://localhost

### Service Access

- Frontend: http://localhost
- Backend API: http://localhost:3001
- MySQL: localhost:3306 (accessible to tools like MySQL Workbench with credentials from docker-compose.yml)

### Stopping the Application

```bash
docker-compose down
```

To also remove the persisted data volumes:

```bash
docker-compose down -v
```

## Development

### Backend Development

```bash
cd backend
npm install
npm run dev
```

### Frontend Development

```bash
cd frontend
npm install
npm start
```

For frontend development, you might want to update the API_URL in App.js to point to your locally running backend.
# todo-k8s
