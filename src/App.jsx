import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loader from './components/Loader';
import Home from './pages/Home';

// Every other page is loaded only when visited, so the first visit downloads less code.
// The admin panel is never downloaded by website visitors.
const publicPages = {
  Trainings: () => import('./pages/Trainings'),
  Internship: () => import('./pages/Internship'),
  Contact: () => import('./pages/Contact'),
  Apply: () => import('./pages/Apply'),
  Gallery: () => import('./pages/Gallery'),
  InstitutionTraining: () => import('./pages/InstitutionTraining'),
  Reviews: () => import('./pages/Reviews'),
  ValidateCertificate: () => import('./pages/ValidateCertificate'),
};
const Trainings = lazy(publicPages.Trainings);
const Internship = lazy(publicPages.Internship);
const Contact = lazy(publicPages.Contact);
const Apply = lazy(publicPages.Apply);
const Gallery = lazy(publicPages.Gallery);
const InstitutionTraining = lazy(publicPages.InstitutionTraining);
const Reviews = lazy(publicPages.Reviews);
const ValidateCertificate = lazy(publicPages.ValidateCertificate);

// Admin
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const ProtectedRoute = lazy(() => import('./components/admin/ProtectedRoute'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const InternshipsAdmin = lazy(() => import('./pages/admin/Internships'));
const ApplicationsAdmin = lazy(() => import('./pages/admin/Applications'));
const StudentsAdmin = lazy(() => import('./pages/admin/Students'));
const PaymentsAdmin = lazy(() => import('./pages/admin/Payments'));
const GalleryAdmin = lazy(() => import('./pages/admin/GalleryAdmin'));
const TrainingsAdmin = lazy(() => import('./pages/admin/TrainingsAdmin'));
const ContactsAdmin = lazy(() => import('./pages/admin/ContactsAdmin'));
const ReviewsAdmin = lazy(() => import('./pages/admin/ReviewsAdmin'));

// Fills the screen while a page's code loads, so the footer doesn't jump when the page appears
const PageLoader = () => (
  <div className="min-h-screen">
    <Loader />
  </div>
);

function App() {
  // Once the current page has loaded, quietly fetch the other public pages' code
  // so moving between pages is instant
  useEffect(() => {
    if (window.location.pathname.startsWith('/admin')) return;
    const prefetch = () => Object.values(publicPages).forEach((load) => load().catch(() => {}));
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(prefetch, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(prefetch, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>} />

        <Route
          path="/admin"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            </Suspense>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="internships" element={<InternshipsAdmin />} />
          <Route path="applications" element={<ApplicationsAdmin />} />
          <Route path="students" element={<StudentsAdmin />} />
          <Route path="payments" element={<PaymentsAdmin />} />
          <Route path="gallery" element={<GalleryAdmin />} />
          <Route path="trainings" element={<TrainingsAdmin />} />
          <Route path="contacts" element={<ContactsAdmin />} />
          <Route path="reviews" element={<ReviewsAdmin />} />
        </Route>

        {/* Public Routes */}
        <Route
          path="*"
          element={
            <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
              <Navbar />
              <main className="flex-grow pt-[80px]">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/trainings" element={<Trainings />} />
                    <Route path="/institution-training" element={<InstitutionTraining />} />
                    <Route path="/internship" element={<Internship />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/apply" element={<Apply />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/reviews" element={<Reviews />} />
                    <Route path="/validate-certificate" element={<ValidateCertificate />} />
                    <Route path="/validate-certificate/:certId" element={<ValidateCertificate />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
