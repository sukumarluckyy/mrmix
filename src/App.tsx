/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AudioProvider } from './context/AudioContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { TrackPage } from './pages/TrackPage';

export default function App() {
  return (
    <AudioProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="track/:slug" element={<TrackPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AudioProvider>
  );
}
