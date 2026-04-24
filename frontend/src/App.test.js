import { render, screen } from '@testing-library/react';

import App from './App';
import { getTasks } from './api/tasks';

jest.mock('./api/tasks', () => ({
  createTask: jest.fn(),
  deleteTask: jest.fn(),
  getTasks: jest.fn(),
}));

test('renders task list title', async () => {
  getTasks.mockResolvedValue({
    data: {
      count: 0,
      next: null,
      previous: null,
      results: [],
    },
  });

  render(<App />);

  expect(await screen.findByText(/lista de tareas/i)).toBeInTheDocument();
});
