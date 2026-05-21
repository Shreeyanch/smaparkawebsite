import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { HelmetProvider } from "react-helmet-async"

import Home from './pages/Home'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Navbar from './components/navbar'
import ReviewGeneratorPage from './pages/ReviewQrGenerator'
import ServicesPage from './pages/Services'
import PricingPage from './pages/Pricing'

const App = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <HelmetProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/reviewqrgenerator" element={<ReviewGeneratorPage />} />
      </Routes>
    </HelmetProvider>
  )
}

export default App
