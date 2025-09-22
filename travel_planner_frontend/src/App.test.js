import { render, screen } from '@testing-library/react';
import App from './App';

test('renders OceanTrip Planner brand', () => {
  render(<App />);
  const brand = screen.getByText(/OceanTrip Planner/i);
  expect(brand).toBeInTheDocument();
});
