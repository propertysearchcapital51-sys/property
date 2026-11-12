import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "./context/LanguageContext";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout/>}>
              <Route index element={<Home/>}/>
              <Route path="about-us" element={<About/>}/>
              <Route path="properties" element={<Properties/>}/>
              <Route path="properties/:slug" element={<PropertyDetails/>}/>
              <Route path="contact" element={<Contact/>}/>
              <Route path="*" element={<NotFound/>}/>
            </Route>
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </HelmetProvider>
  );
}
