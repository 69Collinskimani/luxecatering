"use client";
import RecipeOfDay  from "./RecipeOfDay";
import BlogSection  from "./BlogSection";
import ChefProfiles from "./ChefProfiles";
import SubmitRecipe from "./SubmitRecipe";

export default function CommunitySection() {
  return (
    <>
      <RecipeOfDay />
      <BlogSection />
      <ChefProfiles />
      <SubmitRecipe />
    </>
  );
}