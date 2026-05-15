import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 -z-10" />
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-primary font-semibold tracking-wide uppercase text-sm mb-3">Welcome to SkillifyMe</h2>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
            Enjoy our great selection of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">IT courses & Live Workshops</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
            Choose your learning path and become an IT expert now! Discover your passion and chart your path with our diverse courses—unleash your potential and pursue what truly fascinates you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/trainings" 
              className="px-8 py-4 bg-primary text-white font-medium rounded-lg shadow-lg shadow-primary/30 hover:bg-blue-700 transition-all hover:-translate-y-1"
            >
              Explore Trainings
            </Link>
            <Link 
              to="/internship" 
              className="px-8 py-4 bg-white text-slate-800 font-medium rounded-lg shadow-md hover:shadow-lg transition-all border border-slate-100 hover:-translate-y-1"
            >
              View Internships
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
