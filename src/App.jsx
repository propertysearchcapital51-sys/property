import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "./context/LanguageContext";
import { ContentProvider } from "./context/ContentContext";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

/* Admin area is code-split: visitors never download the editor. */
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminShell = lazy(() => import("./layouts/AdminShell"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminPosts = lazy(() => import("./pages/AdminPosts"));
const AdminPostEditor = lazy(() => import("./pages/AdminPostEditor"));
const AdminContent = lazy(() => import("./pages/AdminContent"));
const AdminProjects = lazy(() => import("./pages/AdminProjects"));
const AdminEnquiries = lazy(() => import("./pages/AdminEnquiries"));
const AdminAccount = lazy(() => import("./pages/AdminAccount"));

export default function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <ContentProvider>
          <BrowserRouter>
            <Suspense fallback={null}>
              <Routes>
                <Route element={<MainLayout/>}>
                  <Route index element={<Home/>}/>
                  <Route path="about-us" element={<About/>}/>
                  <Route path="properties" element={<Properties/>}/>
                  <Route path="properties/:slug" element={<PropertyDetails/>}/>
                  <Route path="blog" element={<Blog/>}/>
                  <Route path="blog/:slug" element={<BlogPost/>}/>
                  <Route path="contact" element={<Contact/>}/>
                  <Route path="*" element={<NotFound/>}/>
                </Route>

                <Route path="admin" element={<AdminLayout/>}>
                  <Route path="login" element={<AdminLogin/>}/>
                  <Route element={<AdminShell/>}>
                    <Route index element={<AdminDashboard/>}/>
                    <Route path="posts" element={<AdminPosts/>}/>
                    <Route path="posts/new" element={<AdminPostEditor/>}/>
                    <Route path="posts/:id" element={<AdminPostEditor/>}/>
                    <Route path="content" element={<AdminContent/>}/>
                    <Route path="projects" element={<AdminProjects/>}/>
                    <Route path="enquiries" element={<AdminEnquiries/>}/>
                    <Route path="account" element={<AdminAccount/>}/>
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ContentProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}
