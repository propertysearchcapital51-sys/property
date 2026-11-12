import { Outlet } from "react-router-dom";
import Preloader from "../components/Preloader";
import SmoothScroll from "../components/SmoothScroll";
import ScrollProgress from "../components/ScrollProgress";
import CustomCursor from "../components/CustomCursor";
import PageTransition from "../components/PageTransition";
import ScrollEffects from "../components/ScrollEffects";
import AnnouncementBar from "../components/AnnouncementBar";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function MainLayout() {
  return (
    <>
      <Preloader />
      <SmoothScroll />
      <ScrollProgress />
      <CustomCursor />
      <PageTransition />
      <ScrollEffects />
      <AnnouncementBar />
      <Header />
      <main><Outlet /></main>
      <Footer />
    </>
  );
}
