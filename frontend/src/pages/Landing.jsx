import { Login } from "@/components/Login";
import { CreateUser } from "@/components/Createuser";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Landing() {
  const [view, setView] = useState(0);

  return (
    <div>
      {!view ? (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center">
            <div
              className="flex flex-col hover:cursor-pointer z-10 p-8 rounded-xl mr-10 mb-6 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 xl:w-1/4 text-justify
                transition-transform transform hover:scale-105
                animate-fade-in-left"
            >
              <div
                className="text-xl mb-3 font-bold text-gray-800
                  "
              >
                Welcome to Learn French for Beginners
              </div>
              <p
                className="text-gray-600 mb-4 
                  "
              >
                We are thrilled to have you join us. Please log in to get
                started.
              </p>
              <p
                className="text-gray-600 
                  "
              >
                This platform is tailor-made for beginners. By logging in,
                you'll gain access to our foundational courses, interactive
                tutorials, and valuable resources that will help you embark on
                your journey to learning French.
              </p>

              <Button
                variant="link"
                className="mt-4 "
                onClick={() => setView(!view)}
              >
                Don't have an Account yet? Sign up
              </Button>
            </div>
            <Login className="" />
            <div className="mt-3"></div>
          </div>
        </>
      ) : (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-10 flex flex-col items-center justify-center">
            <CreateUser className="animate-slide-up" />
            <div className="mt-3">
              <Button
                variant="link"
                className="animate-fade-in"
                onClick={() => setView(!view)}
              >
                Already have an Account? Log in
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
