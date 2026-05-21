// src/components/blogPosts/index.js

import { CaffeophiliaCase } from "./caffeophiliaCase";
import { RedefiningCustomerLoyalty } from "./RedefiningCustomerLoyalty";
import { PsychologyOfLoyalty } from "./PsychologyOfLoyalty";
import { GamificationPost } from "./GamificationPost";
import { TheNewBarber } from "./TheNewBarber";
import { CinnamonGarden } from "./CinnamonGarden";
import { Mira } from "./Mira";
import { KathmanduCoffeeMap } from "./KathmanduCoffeeMap";
import { RestaurantLoyaltyApp } from "./RestaurantLoyaltyApp";
import { ReeloAlternative } from "./ReeloAlternative";
import { SalonLoyaltyProgram } from "./SalonLoyaltyProgram";
import { WhatsAppLoyaltyGuide } from "./WhatsAppLoyaltyGuide";
import { BrandedLoyaltyAppPWA } from "./BrandedLoyaltyAppPWA";
import { BarbershopLoyaltyProgram } from "./BarbershopLoyaltyProgram";
import { LoyaltyPlatformsComparison } from "./LoyaltyPlatformsComparison";
import { ReeloAlternativeIndia } from "./ReeloAlternativeIndia";
import { HimalayanJavaExpressLoyaltyApp } from "./HImalayanJavaExpressLoyaltyApp";

// Array of all blog posts
export const blogPosts = [
  CaffeophiliaCase,
  RedefiningCustomerLoyalty,
  PsychologyOfLoyalty,
  GamificationPost,
  TheNewBarber,
  CinnamonGarden,
  Mira,
  KathmanduCoffeeMap,
  RestaurantLoyaltyApp,
  ReeloAlternative,
  SalonLoyaltyProgram,
  WhatsAppLoyaltyGuide,
  BrandedLoyaltyAppPWA,
  BarbershopLoyaltyProgram,
  LoyaltyPlatformsComparison,
  ReeloAlternativeIndia,
  HimalayanJavaExpressLoyaltyApp,
];

// Helper functions
export const getPostById = (id) => {
  return blogPosts.find((post) => post.id === parseInt(id));
};

export const getPostBySlug = (slug) => {
  return blogPosts.find((post) => post.slug === slug);
};

export const getRelatedPosts = (currentPostId, limit = 3) => {
  return blogPosts.filter((post) => post.id !== currentPostId).slice(0, limit);
};
