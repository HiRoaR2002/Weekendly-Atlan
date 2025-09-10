import { render, screen } from '@testing-library/react';
import App from './App';

test('renders weekend planner heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Weekendly/i);
  expect(headingElement).toBeInTheDocument();
});
