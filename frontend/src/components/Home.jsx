import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import Feed from "./Feed";

const Home = () => {
  useGetAllJobs();
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 py-6">
        <Feed />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center space-x-4 text-xs text-gray-500">
            <span>© 2025</span>
            <a href="#" className="hover:underline">About</a>
            <a href="#" className="hover:underline">Accessibility</a>
            <a href="#" className="hover:underline">User Agreement</a>
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Cookie Policy</a>
            <a href="#" className="hover:underline">Copyright Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
