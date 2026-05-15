import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import CourseCard from '../components/CourseCard';
import Loader from '../components/Loader';

const Trainings = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('id', { ascending: true });

        if (error) throw error;
        setCourses(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Our Trainings</h1>
          <p className="text-lg text-slate-600">
            Elevate your skills with our comprehensive IT courses. Choose your path and become an expert.
          </p>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <div className="text-center p-8 bg-red-50 text-red-500 rounded-xl max-w-md mx-auto">
            Failed to load courses. Please check your connection or Supabase configuration.
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
            <p className="text-slate-500 text-lg">No courses available at the moment. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Trainings;
