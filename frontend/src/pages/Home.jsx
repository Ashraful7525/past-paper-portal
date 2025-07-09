import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        Welcome to the Home Page!
      </h1>
      <p className="text-lg text-gray-700 max-w-xl text-center">
        This is your React + Vite + Tailwind CSS starter page. Customize this page to suit your app’s needs.
      </p>
    </div>
  );
};

export default Home;
