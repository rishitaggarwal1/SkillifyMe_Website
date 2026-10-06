import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Trainings from './pages/Trainings';
import Internship from './pages/Internship';
import Contact from './pages/Contact';
import Apply from './pages/Apply';
import Gallery from './pages/Gallery';
import InstitutionTraining from './pages/InstitutionTraining';

// Admin imports
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import InternshipsAdmin from './pages/admin/Internships';
import ApplicationsAdmin from './pages/admin/Applications';
import StudentsAdmin from './pages/admin/Students';
import PaymentsAdmin from './pages/admin/Payments';
import GalleryAdmin from './pages/admin/GalleryAdmin';
import TrainingsAdmin from './pages/admin/TrainingsAdmin';
import ContactsAdmin from './pages/admin/ContactsAdmin';
import ReviewsAdmin from './pages/admin/ReviewsAdmin';
import Reviews from './pages/Reviews';

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
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
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/trainings" element={<Trainings />} />
                  <Route path="/institution-training" element={<InstitutionTraining />} />
                  <Route path="/internship" element={<Internship />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/apply" element={<Apply />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/reviews" element={<Reviews />} />
                </Routes>
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
