"use client";
import MealSuggestions      from "./MealSuggestions";
import { PersonalizedRecs } from "./PersonalizedRecs";
import { DailyFusion }      from "./DailyFusion";
import { DietaryAnalysis }  from "./DietaryAnalysis";

export default function AISection({ viewHistory }) {
  return (
    <section id="ai-chef" className="py-24 px-4" style={{ background: "#1A1A1A" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "#C84B31" }}>Powered by Claude AI</div>
          <h2 className="text-4xl font-black mb-4 text-white" style={{ fontFamily: "Georgia,serif" }}>
            Your <span style={{ color: "#C84B31" }}>AI Chef</span> Assistant
          </h2>
          <p style={{ color: "#888" }}>Smart tools to help you cook better, eat healthier, and discover new flavors</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <MealSuggestions />
          <DailyFusion />
          <PersonalizedRecs viewHistory={viewHistory} />
          <DietaryAnalysis />
        </div>
      </div>
    </section>
  );
}