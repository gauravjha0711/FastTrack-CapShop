import React from "react";
import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Container className="page-container">
        <Outlet />
      </Container>
      <Footer />
    </>
  );
};

export default MainLayout;