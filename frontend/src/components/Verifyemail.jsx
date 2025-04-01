import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "@/api"; // Import the API function
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the toast styles

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    async function handleVerification() {
      try {
        const { status } = await verifyEmail(token); // Call the backend API to verify the token
        if (status === 200) {
          // Display the success toast notification
          toast.success("Your email has been verified successfully!", {
            position: "top-center", // Center the toast at the top
            autoClose: 3000, // Automatically close after 3 seconds
            hideProgressBar: true, // Hide the progress bar
            closeOnClick: true, // Close toast on click
            pauseOnHover: true, // Pause on hover
            draggable: true, // Allow dragging
          });
          setTimeout(() => {
            navigate("/"); // Redirect the user to login page after success
          }, 3000); // Delay redirection to allow users to see the toast
        } else {
          toast.error("Failed to verify your email. Please try again.", {
            position: "top-center",
            autoClose: 3000,
          });
        }
      } catch (error) {
        // Show an error toast if verification fails
        toast.error("Invalid or expired verification link.", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    }

    if (token) {
      handleVerification(); // Verify the email when the token is present
    } else {
      toast.error("No verification token provided.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  }, [token, navigate]);

  return (
    <>
      {/* Toast Container to display messages */}
      <ToastContainer />
      <div className="flex flex-col justify-center items-center h-screen bg-background">
        {/* Success or Error messages are handled through toasts */}
        <div className="bg-card p-8 rounded-lg shadow-lg text-center w-96">
          <h1 className="text-2xl font-semibold text-muted-foreground">
            Processing verification...
          </h1>
        </div>
      </div>
    </>
  );
}
