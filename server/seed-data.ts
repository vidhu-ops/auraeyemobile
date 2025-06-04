import { storage } from "./storage";

export async function seedHealers() {
  try {
    // Check if healers already exist
    const existingHealers = await storage.getAllHealers();
    if (existingHealers.length > 0) {
      console.log("Healers already seeded");
      return;
    }

    const healersData = [
      {
        name: "Dr. Sarah Chen",
        specialty: "Energy Healing & Chakra Balancing",
        description: "With over 15 years of experience in energy healing, Dr. Chen specializes in chakra alignment and spiritual wellness. She combines traditional Eastern practices with modern healing techniques.",
        email: "sarah.chen@spiritualwellness.com",
        phone: "+1-555-0123",
        imageUrl: "/api/placeholder/300/300",
        rating: 5,
        experience: "15+ years",
        location: "San Francisco, CA"
      },
      {
        name: "Master Liu Wei",
        specialty: "Aura Reading & Spiritual Guidance",
        description: "Master Liu is a renowned aura reader and spiritual guide who has helped thousands discover their true spiritual path. His intuitive abilities are complemented by deep meditation practices.",
        email: "liu.wei@spiritualwellness.com",
        phone: "+1-555-0124",
        imageUrl: "/api/placeholder/300/300",
        rating: 5,
        experience: "20+ years",
        location: "Los Angeles, CA"
      },
      {
        name: "Dr. Maya Patel",
        specialty: "Numerology & Life Path Analysis",
        description: "Dr. Patel is an expert in numerological analysis and life path guidance. She helps clients understand their cosmic blueprint through detailed numerological interpretations.",
        email: "maya.patel@spiritualwellness.com",
        phone: "+1-555-0125",
        imageUrl: "/api/placeholder/300/300",
        rating: 5,
        experience: "12+ years",
        location: "New York, NY"
      },
      {
        name: "Reverend Michael Stone",
        specialty: "Crystal Healing & Meditation",
        description: "Reverend Stone combines crystal healing with guided meditation to create transformative spiritual experiences. His sessions focus on inner peace and spiritual awakening.",
        email: "michael.stone@spiritualwellness.com",
        phone: "+1-555-0126",
        imageUrl: "/api/placeholder/300/300",
        rating: 5,
        experience: "18+ years",
        location: "Denver, CO"
      },
      {
        name: "Dr. Amara Johnson",
        specialty: "Holistic Wellness & Spiritual Coaching",
        description: "Dr. Johnson takes a holistic approach to spiritual wellness, combining life coaching with spiritual practices to help clients achieve balance and purpose.",
        email: "amara.johnson@spiritualwellness.com",
        phone: "+1-555-0127",
        imageUrl: "/api/placeholder/300/300",
        rating: 5,
        experience: "10+ years",
        location: "Austin, TX"
      }
    ];

    for (const healerData of healersData) {
      await storage.createHealer(healerData);
    }

    console.log("Successfully seeded healers data");
  } catch (error) {
    console.error("Error seeding healers:", error);
  }
}