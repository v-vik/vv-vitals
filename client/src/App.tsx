import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Diary from './pages/Diary';
import FoodLibrary from './pages/FoodLibrary';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <nav className="border-b border-slate-200 bg-white px-4 py-4">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <span className="text-xl font-semibold">v--v Vitals</span>
            <div className="flex gap-6 text-sm font-medium">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                }
              >
                Diary
              </NavLink>
              <NavLink
                to="/foods"
                className={({ isActive }) =>
                  isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                }
              >
                Food Library
              </NavLink>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-3xl px-4 py-8">
          <Routes>
            <Route path="/" element={<Diary />} />
            <Route path="/foods" element={<FoodLibrary />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
