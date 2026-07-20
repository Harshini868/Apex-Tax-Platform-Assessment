import React from 'react';
import { BrowserRouter } from 'react-router';
import { AppProvider } from '../context/AppContext';
import { AppRoutes } from './routes';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
};
export default App;
