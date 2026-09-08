import { db } from "../db";
import { users, healers } from "../../shared/schema";
import { hashPassword } from "../auth";
import { eq } from "drizzle-orm";

const healerNames = [
  "Shweta.Singh",
  "Reema.Chopra", 
  "Varsha.Gangrade",
  "Shradha.Sharma",
  "Paridhi.Rustagi",
  "Deepa_Rathore",
  "Jahnavi.sarma",
  "Kiran.Ajay",
  "Manikyamba.Talari",
  "Rameeta.A",
  "Annapoorna.kumaar",
  "Rameeeta.a",
  "Shaina.Mohite",
  "Pooja.Taneja",
  "Shradha.sharma",
  "Avanthi.maniyala",
  "Ashwini.Badgandi",
  "Deepika",
  "Manolinie",
  "Ashwini.Badgandi",
  "Avisha.kabra",
  "Pratibha.Pandya",
  "Arti.Shah",
  "Roopa.Singh",
  "Anju.Choudhary",
  "Suvarna",
  "Bhvna Ammbre",
  "Meeta.Singh",
  "Vishwajeet.RKamal",
  "Jaspaul.kalsi9",
  "Swetta.Mandal",
  "Sujithra.ananth",
  "Ankita_Gupta",
  "Subramanyam.v",
  "Jahnavi.sarma",
  "Lacsshmi.Raama",
  "Venugopal",
  "Nikhil.Vashi",
  "Anjaly.Kotiyan",
  "SonalMGarg",
  "Abhishek.Patel",
  "RAVijaya",
  "Zarina.Aziz",
  "Madhvi_suba",
  "Khushboo.rathi",
  "Bhavya.Singhal.Tiwari",
  "Bhawnaa.Sharma",
  "VaishaliRathi",
  "Rutima Gopala",
  "Janvi.Adesara",
  "Abhishek.Patel",
  "Indu.Nandakumar",
  "Shwweta.Sharmma",
  "Prince3445",
  "Purti.Sadh",
  "Darshana.Jani",
  "Meenakshii.kapoor",
  "Csarti",
  "Prashanth.Sagar",
  "Arti.Chauhan"
];

const specialties = [
  "Aura Reading Specialist",
  "Chakra Balancing Expert", 
  "Energy Healing Practitioner",
  "Spiritual Life Coach",
  "Crystal Healing Therapist",
  "Reiki Master",
  "Tarot Card Reader",
  "Numerology Expert",
  "Meditation Guide",
  "Past Life Regression Therapist"
];

const getRandomSpecialty = () => {
  return specialties[Math.floor(Math.random() * specialties.length)];
};

const getRandomExperience = () => {
  const years = Math.floor(Math.random() * 15) + 3; // 3-17 years
  return `${years} years of professional healing practice`;
};

const getRandomLocation = () => {
  const locations = [
    "Mumbai, India",
    "Delhi, India", 
    "Bangalore, India",
    "Chennai, India",
    "Pune, India",
    "Hyderabad, India",
    "Kolkata, India",
    "Ahmedabad, India",
    "Jaipur, India",
    "Lucknow, India"
  ];
  return locations[Math.floor(Math.random() * locations.length)];
};

const generateDescription = (name: string, specialty: string, experience: string) => {
  const firstName = name.split('.')[0];
  return `${firstName} is a dedicated ${specialty.toLowerCase()} with ${experience}. Known for providing compassionate and insightful guidance to help clients on their spiritual journey. Specializes in holistic healing approaches and intuitive energy work.`;
};

const generateEmail = (name: string) => {
  return `${name.toLowerCase().replace(/[^a-z]/g, '')}@aurfy.com`;
};

const generatePhone = () => {
  return `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`;
};

export async function createBulkHealers() {
  try {
    console.log('Starting bulk healer creation...');
    const hashedPassword = await hashPassword('healer123');
    
    let created = 0;
    let skipped = 0;
    
    for (const name of healerNames) {
      try {
        // Check if user already exists
        const existingUser = await db.select().from(users).where(eq(users.username, name)).limit(1);
        
        if (existingUser.length > 0) {
          console.log(`Skipping ${name} - user already exists`);
          skipped++;
          continue;
        }
        
        // Create user account
        const [newUser] = await db.insert(users).values({
          username: name,
          password: hashedPassword,
          userType: 'healer',
          credits: 150, // 150 credits as requested
          email: generateEmail(name),
          mobileNumber: generatePhone()
        }).returning();
        
        const specialty = getRandomSpecialty();
        const experience = getRandomExperience();
        const location = getRandomLocation();
        
        // Create healer profile
        await db.insert(healers).values({
          name: name.replace(/[._]/g, ' '), // Convert username to display name
          username: name,
          password: hashedPassword,
          specialty: specialty,
          description: generateDescription(name, specialty, experience),
          email: generateEmail(name),
          phone: generatePhone(),
          rating: 5,
          experience: experience,
          location: location
        });
        
        console.log(`✓ Created healer account: ${name} with 150 credits`);
        created++;
        
      } catch (error) {
        console.error(`Error creating healer ${name}:`, error);
      }
    }
    
    console.log(`\n✅ Bulk healer creation completed:`);
    console.log(`   Created: ${created} healers`);
    console.log(`   Skipped: ${skipped} existing healers`);
    console.log(`   Total processed: ${healerNames.length} names`);
    
  } catch (error) {
    console.error('Bulk healer creation failed:', error);
    throw error;
  }
}

// Execute immediately
createBulkHealers()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });