import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

const Home = lazy(() => import('./pages/Home'));
const Search = lazy(() => import('./pages/Search'));
const Category = lazy(() => import('./pages/Category'));
const Article = lazy(() => import('./pages/Article'));
const Admin = lazy(() => import('./pages/Admin'));
const Login = lazy(() => import('./pages/Login'));

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/article/:slug" element={<Article />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}
