import { createUser } from "@/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateUser() {
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Admin", // Default role is 'Admin'
  });
  const [loading, setLoading] = useState(false); // Loader state

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("Form submitted with data:", user);

    if (user.password !== user.confirmPassword) {
      toast.error("Passwords do not match!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    try {
      setLoading(true); // Enable the loader
      const response = await createUser(user);
      if (response.message === "The email is taken") {
        toast.error("The email is already taken.", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.success(
          "Account created successfully! Please check your email to verify your account.",
          {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            onClose: () => window.location.reload(),
          }
        );
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message || "Error creating Account", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false); // Disable the loader
    }
  }

  function handleChange(e) {
    setUser({ ...user, [e.target.name]: e.target.value });
  }

  function handleRoleChange(value) {
    setUser({ ...user, role: value });
  }

  return (
    <>
      <ToastContainer /> {/* Toast notifications will appear here */}
      <form
        onSubmit={handleSubmit}
        className="bg-secondary p-8 rounded-lg shadow-lg flex flex-col items-center justify-center w-96 hover:cursor-pointer z-10 animate-slide-up"
      >
        <div className="w-full mb-4">
          <Label>Create a new account:</Label>
        </div>

        <Input
          placeholder="Username"
          onChange={handleChange}
          name="username"
          required
          maxLength={20}
          className="mb-2"
        />
        <Input
          placeholder="Email"
          onChange={handleChange}
          name="email"
          required
          maxLength={40}
          type="email"
          className="mb-2"
        />
        <Input
          placeholder="Password"
          onChange={handleChange}
          name="password"
          required
          maxLength={20}
          type="password"
          className="mb-2"
        />
        <Input
          placeholder="Confirm Password"
          onChange={handleChange}
          name="confirmPassword"
          required
          maxLength={20}
          type="password"
          className="mb-2"
        />
        {/* Display role selection for all users */}
        <div className="mb-10 w-full">
          <Select
            name="role"
            value={user.role}
            onValueChange={handleRoleChange}
            required
          >
            <SelectTrigger className="create-new-user">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="User">User</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-center w-full">
          <Button
            className="w-full flex justify-center items-center"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
            ) : (
              "Create account"
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
