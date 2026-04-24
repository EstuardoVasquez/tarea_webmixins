# Tarea Web Mixins

Proyecto full stack para gestionar tareas con Django REST Framework y React.

## Estructura

- `config/`: configuracion principal de Django.
- `tasks/`: app del backend con modelo, serializer, viewset y pruebas.
- `frontend/`: app React creada con Create React App.
- `requirements.txt`: dependencias del backend.

## Backend

```powershell
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

La API queda disponible en `http://localhost:8000/api/`.

Rutas principales:

- `GET /api/tasks/`: listar tareas
- `POST /api/tasks/`: crear tarea
- `DELETE /api/tasks/{id}/`: eliminar tarea
- `POST /api/token/`: obtener token JWT
- `POST /api/token/refresh/`: refrescar token JWT

La API de tareas:

- requiere JWT para acceder
- devuelve solo tareas del usuario autenticado
- permite filtrar por `completed`
- permite buscar por `search`
- pagina resultados de 5 en 5

Ejemplo para crear una tarea:

```json
{
  "title": "Estudiar mixins",
  "completed": false
}
```

Ejemplos de consulta:

- `GET /api/tasks/?completed=true`
- `GET /api/tasks/?search=django`
- `GET /api/tasks/?page=2`
- `GET /api/tasks/?completed=false&search=pan&page=1`

Ejemplo para obtener token:

```json
{
  "username": "maria",
  "password": "clave-segura-123"
}
```

## Frontend

```powershell
cd frontend
npm install
npm start
```

La app React queda disponible en `http://localhost:3000/`.

El frontend usa por defecto `http://localhost:8000/api/`. Si necesitas cambiarlo, crea un archivo `frontend/.env` con:

```env
REACT_APP_API_URL=http://localhost:8000/api/
```

El frontend ya soporta:

- busqueda por titulo
- filtro por estado
- navegacion entre paginas

Para consumir la API protegida, guarda el JWT de acceso en `localStorage` con la clave `token`.

## Verificacion

Backend:

```powershell
python manage.py test
```

Frontend:

```powershell
cd frontend
npm test -- --watchAll=false
npm run build
```
