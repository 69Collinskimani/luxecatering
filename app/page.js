"use client";
import { useState, useCallback } from "react";
import { NAV_LINKS, PACKAGES, TESTIMONIALS, FAQS } from "@/data/static";
import Navbar           from "@/components/Navbar";
import Hero             from "@/components/Hero";
import { About }        from "@/components/About";
import { Pricing }      from "@/components/Pricing";
import { Testimonials } from "@/components/Testimonials";
import { FAQ }          from "@/components/FAQ";
import { Footer }       from "@/components/Footer";
import Contact          from "@/components/Contact";
import RecipeSection    from "@/components/recipes/RecipeSection";
import AISection        from "@/components/ai/AISection";
import AIChefChatbot    from "@/components/ai/AIChefChatbot";
import BookingSection   from "@/components/booking/BookingSection";
import CommunitySection from "@/components/community/CommunitySection";

export default function Home() {
  const [viewHistory, setViewHistory] = useState([]);
  const scrollTo = useCallback(id => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);
  const handleRecipeView = useCallback(name => {
    setViewHistory(p => [...new Set([...p, name])].slice(-10));
  }, []);
  return (
    <div className="bg-gray-950 text-white font-sans min-h-screen">
      <Navbar scrollTo={scrollTo} />
      <Hero scrollTo={scrollTo} />
      <About />
      <Pricing scrollTo={scrollTo} packages={PACKAGES} />
      <BookingSection />
      <RecipeSection onRecipeView={handleRecipeView} />
      <AISection viewHistory={viewHistory} />
      <CommunitySection />
      <Testimonials testimonials={TESTIMONIALS} />
      <FAQ faqs={FAQS} />
      <Contact />
      <Footer scrollTo={scrollTo} navLinks={NAV_LINKS} />
      <AIChefChatbot />
    </div>
  );
}
