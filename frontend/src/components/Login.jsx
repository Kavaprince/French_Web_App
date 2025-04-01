import { verifyUSer } from "@/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export function Login() {
  const [user, setUser] = useState({
    email: "",
    password: "",
    role: "Admin", // Default role
  });
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); // Start loading
    try {
      const response = await verifyUSer(user);
      if (response) {
        sessionStorage.setItem("User", response);
        axios.defaults.headers.common["Authorization"] = `Bearer ${response}`;
        navigate("/dashboard");
      } else {
        alert("Login failed");
      }
    } catch (error) {
      alert("An error occurred during login.");
    } finally {
      setLoading(false); // Stop loading
    }
  }

  function handleChange(e) {
    setUser({ ...user, [e.target.name]: e.target.value });
  }

  function handleRoleChange(value) {
    setUser({ ...user, role: value });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-secondary p-8 rounded-lg shadow-lg flex flex-col items-center justify-center w-96 hover:cursor-pointer z-10 animate-slide-up"
    >
      <div className="w-full mb-4 ">
        <Label>Sign in:</Label>
      </div>

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
      <div className="flex-col w-full">
        <Button
          className="w-full flex justify-center items-center"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <div className="w-6 h-6 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
          ) : (
            "Log in"
          )}
        </Button>
      </div>
    </form>
  );
}
