import { storage } from "./storage";
import { hashPassword } from "./auth";

export async function seedHealers() {
  try {
    // Check if healers already exist
    const existingHealers = await storage.getAllHealers();
    if (existingHealers.length > 0) {
      console.log("Healers already seeded");
      return;
    }

    const healersData = [
      // Static healers - must be created for booking functionality
      {
        name: "Nishant Sharma",
        username: "nishant.sharma2",
        password: await hashPassword("healer123"),
        specialty: "Aura Reading",
        description: "Founded by Nishant Sharma, an IT Engineer with a Master's in Applied Positive Psychology & Coaching Psychology (UEL, London) and over 20 years as a certified Energy healer. AuraEye™ blends cutting-edge technology with authentic energy healing to bring spiritual wellness into the digital age.",
        email: "nishant@auraeye.com",
        phone: "+91-XXXXXXXXXX",
        imageUrl: "/nishant-new.jpg",
        rating: 5,
        experience: "20+ years",
        location: "India"
      },
      {
        name: "Sunita Mann",
        username: "sunita_mann",
        password: await hashPassword("healer123"),
        specialty: "Spiritual Teacher & Healer",
        description: "Sunita Mann is a spiritual teacher & healer with over 20 years of experience. Trained in various modalities like Aura reading, Reiki healing, Angel's therapy etc. With almost 95% success rate in her spiritual evaluation, she can read your energies intuitively and can pinpoint the various issues along with helping you heal the blockages.",
        email: "sunita@auraeye.com",
        phone: "+91-XXXXXXXXXX",
        imageUrl: "/sunita.jpg",
        rating: 5,
        experience: "20+ years",
        location: "India"
      },
      {
        name: "Mr. Subramayanam",
        username: "subramayanam",
        password: await hashPassword("healer123"),
        specialty: "Energy Healer & Engineer",
        description: "Subramayanam is a Mechanical Engineer, Aura Reader, and Energy Healer who blends analytical precision with intuitive insight. With a strong foundation in engineering and energy diagnostics, he specialises in identifying energetic imbalances at their root cause. Through intuitive energy diagnosis and distance healing practices, he helps individuals understand the underlying patterns affecting their emotional, mental, and physical well-being.",
        email: "subramayanam@auraeye.com",
        phone: "+91-XXXXXXXXXX",
        imageUrl: "/subramanyam.jpg",
        rating: 5,
        experience: "15+ years",
        location: "India"
      },
      // Additional healers
      {
        name: "Master Liu Wei",
        username: "liu.wei",
        password: await hashPassword("healer123"),
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
        username: "maya.patel",
        password: await hashPassword("healer123"),
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
        username: "michael.stone",
        password: await hashPassword("healer123"),
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
        username: "amara.johnson",
        password: await hashPassword("healer123"),
        specialty: "Holistic Wellness & Spiritual Coaching",
        description: "Dr. Johnson takes a holistic approach to spiritual wellness, combining life coaching with spiritual practices to help clients achieve balance and purpose.",
        email: "amara.johnson@spiritualwellness.com",
        phone: "+1-555-0127",
        imageUrl: "/api/placeholder/300/300",
        rating: 5,
        experience: "10+ years",
        location: "Austin, TX"
      },
      {
        name: "Test Healer",
        username: "test healer",
        password: await hashPassword("healer123"),
        specialty: "Testing & Development",
        description: "Test healer account for development and testing purposes. Provides full access to healer dashboard functionality.",
        email: "test.healer@spiritualwellness.com",
        phone: "+1-555-9999",
        imageUrl: "/api/placeholder/300/300",
        rating: 5,
        experience: "Testing",
        location: "Development Server"
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