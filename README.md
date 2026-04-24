# Tarea Web Mixins

terminal1:
python manage.py runserver
```

La API queda disponible en `http://localhost:8000/api/`.

Rutas principales:

- `GET /api/tasks/`: listar tareas
- `POST /api/tasks/`: crear tarea
- `DELETE /api/tasks/{id}/`: eliminar tarea
- `POST /api/token/`: obtener token JWT
- `POST /api/token/refresh/`: refrescar token JWT

Ejemplo para crear una tarea:

```json
{
  "title": "Estudiar mixins",
  "completed": false
}
```

## Frontend

```powershell
cd frontend
npm start
```

La app React queda disponible en `http://localhost:3000/`.

El frontend usa por defecto `http://localhost:8000/api/`. Si necesitas cambiarlo, crea un archivo `frontend/.env` con:

```env
REACT_APP_API_URL=http://localhost:8000/api/
```

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
