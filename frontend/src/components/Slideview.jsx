import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SlideView({ topic, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      title: "Learning Objectives",
      content: (
        <div className="animate-fade-in">
          <p className="text-gray-600 mb-4">
            Understand what you will learn in this topic:
          </p>
          <ul className="list-disc list-inside text-lg text-gray-800 leading-loose">
            {topic.learning_objectives.split("\n").map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      title: "Topic Overview",
      content: (
        <div className="animate-fade-in">
          <p className="text-gray-600 mb-4">
            Here's a brief description of the topic:
          </p>
          <div className="p-4 bg-primary-50 rounded-md text-lg text-gray-800 leading-relaxed space-y-4">
            {topic.description.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Examples",
      content: (
        <div className="animate-fade-in">
          <p className="text-gray-600 mb-4">
            Here are some examples to help you learn:
          </p>
          <div className="bg-gray-50 p-4 rounded-md text-lg text-gray-800">
            <pre>
              <code className="whitespace-pre-wrap">{topic.examples}</code>
            </pre>
          </div>
        </div>
      ),
    },
    {
      title: "Helpful Tips",
      content: (
        <div className="animate-fade-in">
          <p className="text-gray-600 mb-4">
            Use these tips to enhance your learning:
          </p>
          <div className="bg-primary-50 p-4 rounded-md text-lg text-gray-800 whitespace-pre-line">
            {topic.tips}
          </div>
        </div>
      ),
    },
    {
      title: "Audio Practice",
      content: (
        <div className="animate-fade-in">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Practice Listening
          </h3>
          {topic.audio?.path ? (
            <div>
              <audio
                controls
                className="w-full mt-4 rounded-md border border-gray-300"
                src={`http://localhost:3000/${topic.audio.path}`}
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          ) : (
            <p className="text-gray-500 mt-4">
              No audio available for this topic.
            </p>
          )}
          <p className="text-gray-600 mt-4">
            Listen carefully and repeat the examples to improve your
            pronunciation.
          </p>
        </div>
      ),
    },
    {
      title: "Great Job!",
      content: (
        <div className="animate-fade-in text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Congratulations!
          </h2>
          <p className="text-gray-600 mb-4">
            You've completed the topic and are ready for the next step.
          </p>
          <div>
            <Button
              onClick={() => setCurrentSlide(0)}
              className="mr-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg px-4 py-2"
            >
              Try Again
            </Button>
            <Button
              onClick={() => navigate(`/questions?topicId=${topic._id}`)}
              className="bg-primary hover:bg-primary-600 text-white rounded-lg px-4 py-2"
            >
              Attempt Questions
            </Button>
          </div>
        </div>
      ),
    },
  ];

  const handlePrevious = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="slide-view-container px-6 py-8 bg-gray-50 min-h-screen flex flex-col justify-center items-center text-left relative animate-slide-up">
      {/* Close Button */}
      <Button
        onClick={onClose}
        className="absolute top-4 right-4 bg-red-50 hover:bg-red-100 text-red-500 rounded-full p-2"
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Progress Bar / Steppers */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex items-center">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-2 ${
                index <= currentSlide ? "bg-primary" : "bg-gray-300"
              } rounded-full`}
            />
          ))}
        </div>
        <div className="flex justify-between text-sm mt-2">
          {slides.map((slide, index) => (
            <span
              key={index}
              className={`text-center ${
                index === currentSlide ? "text-primary" : "text-gray-500"
              }`}
            >
              Step {index + 1}
            </span>
          ))}
        </div>
      </div>

      {/* Slide Content */}
      <div className="slide-view-content p-6 bg-white shadow-xl rounded-lg relative max-w-2xl w-full">
        <h2 className="text-2xl font-semibold mb-4 text-primary">
          {slides[currentSlide].title}
        </h2>
        <div className="text-gray-800">{slides[currentSlide].content}</div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center w-full max-w-2xl mt-6">
        {currentSlide > 0 && (
          <Button
            onClick={handlePrevious}
            className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg px-4 py-2"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Previous
          </Button>
        )}
        {currentSlide < slides.length - 1 && (
          <Button
            onClick={handleNext}
            className="flex items-center bg-primary hover:bg-primary-600 text-white rounded-lg px-4 py-2"
          >
            Next
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
