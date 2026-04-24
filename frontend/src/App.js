import { useCallback, useEffect, useState } from 'react';

import './App.css';
import { createTask, deleteTask, getTasks } from './api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [completedFilter, setCompletedFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadTasks = useCallback(async (pageToLoad = page) => {
    try {
      setLoading(true);
      const params = { page: pageToLoad };

      if (search) {
        params.search = search;
      }

      if (completedFilter !== 'all') {
        params.completed = completedFilter;
      }

      const response = await getTasks(params);
      setTasks(response.data.results);
      setCount(response.data.count);
      setHasNextPage(Boolean(response.data.next));
      setHasPreviousPage(Boolean(response.data.previous));
      setError('');
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        setError('Necesitas un token JWT en localStorage para consultar la API.');
      } else {
        setError('No se pudo cargar la lista de tareas.');
      }
    } finally {
      setLoading(false);
    }
  }, [completedFilter, page, search]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

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
      setError('');

      if (page === 1) {
        await loadTasks(1);
      } else {
        setPage(1);
      }
    } catch (requestError) {
      const titleError = requestError.response?.data?.title?.[0];

      if (requestError.response?.status === 401) {
        setError('Necesitas un token JWT en localStorage para crear tareas.');
      } else {
        setError(titleError || 'No se pudo crear la tarea.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setError('');

      if (tasks.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await loadTasks(page);
      }
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        setError('Necesitas un token JWT en localStorage para eliminar tareas.');
      } else {
        setError('No se pudo eliminar la tarea.');
      }
    }
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    const nextSearch = searchInput.trim();

    if (page === 1 && nextSearch === search) {
      await loadTasks(1);
      return;
    }

    setPage(1);
    setSearch(nextSearch);
  };

  const handleFilterChange = (event) => {
    setPage(1);
    setCompletedFilter(event.target.value);
  };

  return (
    <main className="app-shell">
      <section className="task-panel" aria-labelledby="task-title">
        <div className="title-row">
          <div>
            <p className="eyebrow">Django REST Framework + React</p>
            <h1 id="task-title">Lista de tareas</h1>
          </div>
          <span className="task-count">{count}</span>
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

        <form className="filters-row" onSubmit={handleSearchSubmit}>
          <div className="filter-group">
            <label htmlFor="search-input">Buscar por titulo</label>
            <input
              id="search-input"
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Ej. Django"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="status-filter">Filtrar por estado</label>
            <select
              id="status-filter"
              value={completedFilter}
              onChange={handleFilterChange}
            >
              <option value="all">Todas</option>
              <option value="true">Completadas</option>
              <option value="false">Pendientes</option>
            </select>
          </div>

          <button type="submit">Buscar</button>
        </form>

        {error && <p className="message error">{error}</p>}

        {loading ? (
          <p className="message">Cargando tareas...</p>
        ) : tasks.length === 0 ? (
          <p className="message">No hay tareas para los filtros actuales.</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className="task-item">
                <div className="task-copy">
                  <span>{task.title}</span>
                  <small>{task.completed ? 'Completada' : 'Pendiente'}</small>
                </div>
                <button type="button" onClick={() => handleDelete(task.id)}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="pagination-row">
          <button
            type="button"
            onClick={() => setPage(page - 1)}
            disabled={!hasPreviousPage || loading}
          >
            Anterior
          </button>
          <span className="page-indicator">Pagina {page}</span>
          <button
            type="button"
            onClick={() => setPage(page + 1)}
            disabled={!hasNextPage || loading}
          >
            Siguiente
          </button>
        </div>
      </section>
    </main>
  );
}

export default App;
