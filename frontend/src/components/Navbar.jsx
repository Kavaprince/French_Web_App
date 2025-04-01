import { Link, useNavigate } from "react-router-dom";
import { pageData } from "./pageData";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button"; // Make sure to import the Button component
import * as jwt_decode from "jwt-decode";
import { useEffect, useState } from "react";

export function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});

  useEffect(() => {
    async function loadUserData() {
      const token = sessionStorage.getItem("User");
      if (token) {
        const decodedUser = jwt_decode.jwtDecode(token);

        console.log("Decoded User:", decodedUser); // Log the decoded user data
        setUser(decodedUser); // Set the decoded user data into the state
      }
    }
    loadUserData();
  }, []);

  function handleLogout() {
    sessionStorage.removeItem("User");
    navigate("/");
    //alert("");
  }
  return (
    <Sidebar className="bg-sidebar-border fixed h-screen top-0 left-0 w-60 p-2">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{user.username}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-2">
              {pageData.map((page) => (
                <SidebarMenuItem key={page.path} className="mb-2">
                  <SidebarMenuButton asChild>
                    <Link to={page.path} className="sidebar-menu-trigger">
                      <page.icon className="mr-2" />
                      <span>{page.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* Add the logout button here */}
              <SidebarMenuItem className="mt-4">
                <SidebarMenuButton
                  asChild
                  className="w-full flex items-center justify-center bg-sidebar-accent text-sidebar-accent-foreground font-medium py-2 rounded-md hover:bg-primary hover:text-sidebar-primary-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-ring focus:ring-offset-2"
                >
                  <Button onClick={handleLogout} className="w-full text-center">
                    Log Out
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
