import React from 'react';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Button } from "../ui/button";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
