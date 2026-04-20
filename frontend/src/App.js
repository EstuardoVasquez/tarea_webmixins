import { useEffect, useState } from 'react';

import './App.css';
import { createTask, deleteTask, getTasks } from './api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await getTasks();
      setTasks(response.data);
      setError('');
    } catch (requestError) {
      setError('No se pudo cargar la lista de tareas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setError('Escribe una tarea antes de agregarla.');
      return;
    }

    try {
      setSaving(true);
      await createTask({ title: title.trim(), completed: false });
      setTitle('');
      await loadTasks();
    } catch (requestError) {
      const titleError = requestError.response?.data?.title?.[0];
      setError(titleError || 'No se pudo crear la tarea.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      await loadTasks();
    } catch (requestError) {
      setError('No se pudo eliminar la tarea.');
    }
  };

  return (
    <main className="app-shell">
      <section className="task-panel" aria-labelledby="task-title">
        <div className="title-row">
          <div>
            <p className="eyebrow">Django REST Framework + React</p>
            <h1 id="task-title">Lista de tareas</h1>
          </div>
          <span className="task-count">{tasks.length}</span>
        </div>

        <form className="task-form" onSubmit={handleCreate}>
          <label htmlFor="task-input">Nueva tarea</label>
          <div className="form-row">
            <input
              id="task-input"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Escribe una tarea"
              maxLength={100}
            />
            <button type="submit" disabled={saving}>
              {saving ? 'Agregando' : 'Agregar'}
            </button>
          </div>
        </form>

        {error && <p className="message error">{error}</p>}

        {loading ? (
          <p className="message">Cargando tareas...</p>
        ) : tasks.length === 0 ? (
          <p className="message">Todavia no hay tareas.</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className="task-item">
                <span>{task.title}</span>
                <button type="button" onClick={() => handleDelete(task.id)}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;
