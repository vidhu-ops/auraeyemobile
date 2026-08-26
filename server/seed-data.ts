import { db } from "./db";
import { sql } from "drizzle-orm";
import { hashPassword } from "./auth";

const TWO_MONTH_HEALER_CREDIT_EXPIRY = new Date("2026-10-26T00:00:00+05:30");

// All users from the production CSV export
const CSV_USERS: Array<{
  username: string;
  userType: "client" | "healer" | "semi-healer";
  birthDate?: string;
  email?: string;
  mobileNumber?: string;
  credits: number;
  creditExpiresAt?: Date;
}> = [
  { username: "vidhugupta1996@gmail.com", userType: "client", birthDate: "1996-08-23", credits: 0 },
  { username: "vidhu", userType: "client", birthDate: "1992-11-12", credits: 31 },
  { username: "test@example.com", userType: "healer", credits: 100 },
  { username: "teamnishant", userType: "healer", birthDate: "1987-01-31", credits: 462 },
  { username: "vidhugupta@gmail.com", userType: "client", birthDate: "1996-08-23", credits: 25 },
  { username: "vidhu g", userType: "client", birthDate: "1996-08-23", credits: 50 },
  { username: "rupagupta", userType: "client", birthDate: "1976-02-11", credits: 50 },
  { username: "admin", userType: "client", birthDate: "1987-01-31", credits: 50 },
  { username: "Healer nishant academy", userType: "healer", birthDate: "2025-07-10", email: "nishant@academy.com", mobileNumber: "+1234567890", credits: 100 },
  { username: "Nishant.sharma", userType: "client", birthDate: "2025-07-17", credits: 50 },
  { username: "NishantSharma", userType: "client", birthDate: "1987-01-31", credits: 50 },
  { username: "nishant.sharma2", userType: "healer", credits: 1649 },
  { username: "rupa.gupta", userType: "healer", credits: 262 },
  { username: "vidhu.gupta", userType: "healer", credits: 59 },
  { username: "test healer", userType: "healer", credits: 100 },
  { username: "Shweta.Singh", userType: "healer", email: "shweta402@gmail.com", mobileNumber: "+91 6143889948", credits: 129 },
  { username: "Reema.Chopra", userType: "healer", email: "My360wellness1@gmail.com", mobileNumber: "+91 2575539203", credits: 125 },
  { username: "Varsha.Gangrade", userType: "healer", email: "varshagangrade@aurfy.com", mobileNumber: "+91 7673167341", credits: 150 },
  { username: "DrShradha.Sharma", userType: "healer", email: "shradhasharma@aurfy.com", mobileNumber: "+91 9297679876", credits: 100 },
  { username: "Paridhi.Rustagi", userType: "healer", email: "paridhirustagi@aurfy.com", mobileNumber: "+91 8757066157", credits: 126 },
  { username: "Deepa_Rathore", userType: "healer", email: "deeparathore@aurfy.com", mobileNumber: "+91 8639077887", credits: 150 },
  { username: "Jahnavi.sarma", userType: "healer", email: "jahnavi.aurareader@gmail.com", mobileNumber: "+91 2414783710", credits: 150 },
  { username: "Kiran.Ajay", userType: "healer", email: "kiran26january@gmail.com", mobileNumber: "+91 6069307791", credits: 141 },
  { username: "Manikyamba.Talari", userType: "healer", email: "manikyambatalari@aurfy.com", mobileNumber: "+91 7973894227", credits: 132 },
  { username: "Rameeta.A", userType: "healer", email: "rameetaa@aurfy.com", mobileNumber: "+91 1048728008", credits: 135 },
  { username: "Annapoorna.kumaar", userType: "healer", email: "annapoorna@pawnection.com", mobileNumber: "+91 6550309910", credits: 131 },
  { username: "Rameeeta.a", userType: "healer", email: "rameeetaa@aurfy.com", mobileNumber: "+91 2295150135", credits: 150 },
  { username: "Shaina.Mohite", userType: "healer", email: "shainamohite@aurfy.com", mobileNumber: "+91 3843748026", credits: 137 },
  { username: "Pooja.Taneja", userType: "healer", email: "poojataneja@aurfy.com", mobileNumber: "+91 9674095373", credits: 148 },
  { username: "Shradha.sharma", userType: "healer", email: "shradhasharma@aurfy.com", mobileNumber: "+91 8496053177", credits: 150 },
  { username: "Avanthi.maniyala", userType: "healer", email: "avanthimaniyala@aurfy.com", mobileNumber: "+91 9857185359", credits: 142 },
  { username: "Ashwini.Badgandi", userType: "healer", email: "GlowCSoulAura33@gmail.com", mobileNumber: "+91 4372908026", credits: 148 },
  { username: "Deepika", userType: "healer", email: "deepika@aurfy.com", mobileNumber: "+91 6088948571", credits: 138 },
  { username: "Manolinie", userType: "healer", email: "seihanasoulwork@gmail.com", mobileNumber: "+91 7246578572", credits: 139 },
  { username: "Avisha.kabra", userType: "healer", email: "avishakabra@aurfy.com", mobileNumber: "+91 4324556006", credits: 150 },
  { username: "Pratibha.Pandya", userType: "healer", email: "Pratibha.aurareader@gmail.com", mobileNumber: "+91 4485408008", credits: 127 },
  { username: "Arti.Shah", userType: "healer", email: "artishah@aurfy.com", mobileNumber: "+91 6983420686", credits: 148 },
  { username: "Roopa.Singh", userType: "healer", email: "roopasingh@aurfy.com", mobileNumber: "+91 4235943173", credits: 131 },
  { username: "Anju.Choudhary", userType: "healer", email: "anjuchoudhary@aurfy.com", mobileNumber: "+91 5462757724", credits: 116 },
  { username: "Suvarna", userType: "healer", email: "suvarna@aurfy.com", mobileNumber: "+91 3137311579", credits: 122 },
  { username: "Bhvna Ammbre", userType: "healer", email: "bhvnaammbre@aurfy.com", mobileNumber: "+91 8436271020", credits: 145 },
  { username: "Meeta.Singh", userType: "healer", email: "radiantsoul.meeta@gmail.com", mobileNumber: "+91 5026788111", credits: 111 },
  { username: "Vishwajeet.RKamal", userType: "healer", email: "vishwajeetrkamal@aurfy.com", mobileNumber: "+91 3947314614", credits: 150 },
  { username: "Jaspaul.kalsi9", userType: "healer", email: "Healerjaspaul.kalsi6@gmail.com", mobileNumber: "+91 6245768665", credits: 128 },
  { username: "Swetta.Mandal", userType: "healer", email: "swettamandal@aurfy.com", mobileNumber: "+91 3828377907", credits: 103 },
  { username: "Sujithra.ananth", userType: "healer", email: "sujithraananth@aurfy.com", mobileNumber: "+91 8279817073", credits: 114 },
  { username: "Ankita_Gupta", userType: "healer", email: "ankitagupta@aurfy.com", mobileNumber: "+91 4738972921", credits: 142 },
  { username: "Subramanyam.v", userType: "healer", email: "subramanyam.aurahealer@gmail.com", mobileNumber: "+91 4532147556", credits: 139 },
  { username: "Lacsshmi.Raama", userType: "healer", email: "lacsshmiraama@aurfy.com", mobileNumber: "+91 7924575675", credits: 139 },
  { username: "Venugopal", userType: "healer", email: "venugopal@aurfy.com", mobileNumber: "+91 2946557847", credits: 143 },
  { username: "Nikhil.Vashi", userType: "healer", email: "NikhilSVashi.SoulCoach@gmail.com", mobileNumber: "+91 8132538008", credits: 129 },
  { username: "Anjaly.Kotiyan", userType: "healer", email: "anjalykotiyan@aurfy.com", mobileNumber: "+91 4782330652", credits: 150 },
  { username: "SonalMGarg", userType: "healer", email: "gargsonal16779@gmail.com", mobileNumber: "+91 1873672181", credits: 108 },
  { username: "Abhishek.Patel", userType: "healer", email: "healerabhishhek@gmail.com", mobileNumber: "+91 1586791836", credits: 138 },
  { username: "RAVijaya", userType: "healer", email: "ravijayakrishnaaura@gmail.com", mobileNumber: "+91 9404500556", credits: 150 },
  { username: "Zarina.Aziz", userType: "healer", email: "zarinaaziz@aurfy.com", mobileNumber: "+91 6579131841", credits: 145 },
  { username: "Madhvi_suba", userType: "healer", email: "madhvisuba@aurfy.com", mobileNumber: "+91 4487621833", credits: 150 },
  { username: "Khushboo.rathi", userType: "healer", email: "khushboo.aurareader@gmail.com", mobileNumber: "+91 7251885479", credits: 145 },
  { username: "Bhavya.Singhal.Tiwari", userType: "healer", email: "bhavyasinghaltiwari@aurfy.com", mobileNumber: "+91 4632955120", credits: 139 },
  { username: "Bhawnaa.Sharma", userType: "healer", email: "bhawnaasharma@aurfy.com", mobileNumber: "+91 1254356734", credits: 138 },
  { username: "DrVaishaliRathi", userType: "healer", email: "vaishalirathi@aurfy.com", mobileNumber: "+91 9619667074", credits: 145 },
  { username: "Rutima.Gopala", userType: "healer", email: "rutimagopalaaurareader123456@gmail.com", mobileNumber: "+91 3957641387", credits: 118 },
  { username: "Janvi.Adesara", userType: "healer", email: "janvi.mukhiya@gmail.com", mobileNumber: "+91 8385306588", credits: 150 },
  { username: "Indu.Nandakumar", userType: "healer", email: "indunandakumar@aurfy.com", mobileNumber: "+91 2622010930", credits: 106 },
  { username: "Shwweta.Sharmma", userType: "healer", email: "shwetansh666@gmail.com", mobileNumber: "+91 7132975794", credits: 135 },
  { username: "Prince3445", userType: "healer", email: "prince@aurfy.com", mobileNumber: "+91 4047748767", credits: 150 },
  { username: "Purti.Sadh", userType: "healer", email: "aurareaderpurti@gmail.com", mobileNumber: "+91 5515855345", credits: 138 },
  { username: "Darshana.Jani", userType: "healer", email: "dr.darshana.jani@gmail.com", mobileNumber: "+91 1157148817", credits: 130 },
  { username: "Meenakshii.kapoor", userType: "healer", email: "meenakshiikapoor@aurfy.com", mobileNumber: "+91 8541965160", credits: 105 },
  { username: "Csarti", userType: "healer", email: "csarti@aurfy.com", mobileNumber: "+91 3787363288", credits: 59 },
  { username: "Prashanth.Sagar", userType: "healer", email: "prashanthsagar@aurfy.com", mobileNumber: "+91 1829191567", credits: 138 },
  { username: "Arti.Chauhan", userType: "healer", email: "chauhan.s.arti@gmail.com", mobileNumber: "+91 9513551322", credits: 150 },
  { username: "Nishthaa.duseja", userType: "healer", email: "nishthaa.duseja@aurfy.com", credits: 70 },
  { username: "Sharmila.Nagwekar", userType: "healer", email: "sharmila.nagwekar@aurfy.com", credits: 132 },
  { username: "Ramona_Jind", userType: "healer", email: "ramona_jind@aurfy.com", credits: 120 },
  { username: "Sweta.Verma.Rawat", userType: "healer", email: "swetavermarawat.hr@gmail.com", credits: 125 },
  { username: "Karthika.Madhu", userType: "healer", email: "thekiyoraascension@gmail.com", credits: 138 },
  { username: "Sunita.Mann", userType: "healer", email: "sunita.mann@auraeye.com", credits: 25 },
  { username: "Namrata.kukadiya", userType: "healer", email: "namrata.kukadiya@auraeye.com", credits: 135 },
  { username: "test.user", userType: "healer", credits: 99 },
  { username: "auraeye.solutions", userType: "healer", email: "contact@auraeye.solutions", credits: 2375 },
  { username: "healernishantacademy", userType: "healer", email: "info@healernishantacademy.com", credits: 3000 },
  { username: "Dr.AnjanaBarot", userType: "healer", email: "aurareaderanjana@gmail.com", credits: 150 },
  { username: "Kalpana.Muralidhar", userType: "healer", email: "kalpanaa.murli@gmail.com", credits: 138 },
  { username: "Ananya.Reddy11", userType: "healer", email: "ananya.reddy11@aurfy.com", credits: 20 },
  { username: "Manolinie.Parbat", userType: "healer", email: "manolinie.parbat@aurfy.com", credits: 75 },
  { username: "cps.tom", userType: "healer", credits: 50 },
  { username: "cps.gill", userType: "healer", credits: 50 },
  { username: "P.Lalitha", userType: "healer", credits: 40, creditExpiresAt: TWO_MONTH_HEALER_CREDIT_EXPIRY },
  { username: "Manisha.Sajnani", userType: "healer", credits: 40, creditExpiresAt: TWO_MONTH_HEALER_CREDIT_EXPIRY },
  { username: "Falguni.Mehta", userType: "healer", credits: 40, creditExpiresAt: TWO_MONTH_HEALER_CREDIT_EXPIRY },
  { username: "Bhavna.Ambre", userType: "healer", credits: 40, creditExpiresAt: TWO_MONTH_HEALER_CREDIT_EXPIRY },
  // test account
  { username: "test.client", userType: "client", email: "test.client@spiritualwellness.com", credits: 5 },
];

// Known healer profiles with full details
const HEALER_PROFILES: Record<string, { name: string; specialty: string; description: string; email: string; phone: string; imageUrl?: string; experience?: string; location?: string }> = {
  "nishant.sharma2": {
    name: "Nishant Sharma",
    specialty: "Aura Reading & Energy Healing",
    description: "Founded by Nishant Sharma, an IT Engineer with a Master's in Applied Positive Psychology & Coaching Psychology (UEL, London) and over 20 years as a certified Energy healer. AuraEye™ blends cutting-edge technology with authentic energy healing to bring spiritual wellness into the digital age.",
    email: "nishant@auraeye.com",
    phone: "+91-XXXXXXXXXX",
    imageUrl: "/nishant-new.jpg",
    experience: "20+ years",
    location: "India"
  },
  "Sunita.Mann": {
    name: "Sunita Mann",
    specialty: "Spiritual Teacher & Healer",
    description: "Sunita Mann is a spiritual teacher & healer with over 20 years of experience. Trained in various modalities like Aura reading, Reiki healing, Angel's therapy etc. With almost 95% success rate in her spiritual evaluation, she can read your energies intuitively and can pinpoint the various issues along with helping you heal the blockages.",
    email: "sunita.mann@auraeye.com",
    phone: "+91-XXXXXXXXXX",
    imageUrl: "/sunita.jpg",
    experience: "20+ years",
    location: "India"
  },
  "Subramanyam.v": {
    name: "Mr. Subramayanam",
    specialty: "Energy Healer & Engineer",
    description: "Subramayanam is a Mechanical Engineer, Aura Reader, and Energy Healer who blends analytical precision with intuitive insight. With a strong foundation in engineering and energy diagnostics, he specialises in identifying energetic imbalances at their root cause.",
    email: "subramanyam.aurahealer@gmail.com",
    phone: "+91 4532147556",
    imageUrl: "/subramanyam.jpg",
    experience: "15+ years",
    location: "India"
  },
  "test healer": {
    name: "Test Healer",
    specialty: "Testing & Development",
    description: "Test healer account for development and testing purposes.",
    email: "test.healer@spiritualwellness.com",
    phone: "+1-555-9999",
    experience: "Testing",
    location: "Development Server"
  },
};

function buildHealerProfile(username: string, email?: string, mobileNumber?: string) {
  const known = HEALER_PROFILES[username];
  if (known) return known;
  const displayName = username.replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return {
    name: displayName,
    specialty: "Spiritual Healer & Aura Reader",
    description: `${displayName} is a certified spiritual healer and energy reader with extensive experience in aura reading and holistic wellness.`,
    email: email ?? `${username.toLowerCase().replace(/[\s.]/g, "")}@aurfy.com`,
    phone: mobileNumber ?? "+91-XXXXXXXXXX",
    experience: null,
    location: "India",
  };
}

export async function runStartupSeed() {
  try {
    console.log("🌱 Starting database seed...");

    // Hash the universal password once
    const universalHash = await hashPassword("healer123");

    // ── 1. Upsert all users ──────────────────────────────────────────────────
    let userInserted = 0;
    let userUpdated = 0;

    for (const u of CSV_USERS) {
      const creditExpiresAt = u.creditExpiresAt ?? null;
      const existing = await db.execute(
        sql`SELECT id FROM users WHERE LOWER(username) = LOWER(${u.username}) LIMIT 1`
      );

      if (existing.rows.length > 0) {
        await db.execute(
          sql`UPDATE users SET
            password = ${universalHash},
            user_type = ${u.userType},
            credits = CASE
              WHEN CAST(${creditExpiresAt} AS timestamp) IS NOT NULL AND CAST(${creditExpiresAt} AS timestamp) <= NOW() THEN 0
              WHEN CAST(${creditExpiresAt} AS timestamp) IS NOT NULL THEN credits
              ELSE GREATEST(credits, ${u.credits})
            END,
            email = COALESCE(NULLIF(email, ''), ${u.email ?? null}),
            mobile_number = COALESCE(NULLIF(mobile_number, ''), ${u.mobileNumber ?? null}),
            credit_expires_at = COALESCE(CAST(${creditExpiresAt} AS timestamp), credit_expires_at),
            is_active = true
          WHERE LOWER(username) = LOWER(${u.username})`
        );
        userUpdated++;
      } else {
        await db.execute(
          sql`INSERT INTO users (username, password, user_type, birth_date, email, mobile_number, credits, credit_expires_at, soul_energy, email_notifications_enabled, is_active)
          VALUES (${u.username}, ${universalHash}, ${u.userType}, ${u.birthDate ?? null}, ${u.email ?? null}, ${u.mobileNumber ?? null},
            CASE WHEN CAST(${creditExpiresAt} AS timestamp) IS NOT NULL AND CAST(${creditExpiresAt} AS timestamp) <= NOW() THEN 0 ELSE ${u.credits} END,
            CAST(${creditExpiresAt} AS timestamp), 0, true, true)
          ON CONFLICT (username) DO NOTHING`
        );
        userInserted++;
      }
    }

    console.log(`✅ Users: ${userInserted} inserted, ${userUpdated} updated`);

    // ── 2. Upsert healer profiles for all healer-type users ──────────────────
    let healerInserted = 0;
    let healerUpdated = 0;

    for (const u of CSV_USERS) {
      if (u.userType !== "healer" && u.userType !== "semi-healer") continue;

      const profile = buildHealerProfile(u.username, u.email, u.mobileNumber);

      const existingH = await db.execute(
        sql`SELECT id FROM healers WHERE LOWER(username) = LOWER(${u.username}) LIMIT 1`
      );

      if (existingH.rows.length > 0) {
        await db.execute(
          sql`UPDATE healers SET password = ${universalHash} WHERE LOWER(username) = LOWER(${u.username})`
        );
        healerUpdated++;
      } else {
        await db.execute(
          sql`INSERT INTO healers (name, username, password, specialty, description, email, phone, image_url, rating, experience, location)
          VALUES (${profile.name}, ${u.username}, ${universalHash}, ${profile.specialty}, ${profile.description}, ${profile.email}, ${profile.phone}, ${(profile as any).imageUrl ?? null}, 5, ${profile.experience ?? null}, ${profile.location ?? 'India'})
          ON CONFLICT (username) DO NOTHING`
        );
        healerInserted++;
      }
    }

    console.log(`✅ Healers: ${healerInserted} inserted, ${healerUpdated} updated`);

    // ── 3. Ensure ALL healers in healers table also exist in users table ──────
    const orphanHealers = await db.execute(
      sql`SELECT h.username, h.email, h.phone FROM healers h
      WHERE NOT EXISTS (SELECT 1 FROM users u WHERE LOWER(u.username) = LOWER(h.username))`
    );

    let orphanFixed = 0;
    for (const row of orphanHealers.rows as any[]) {
      await db.execute(
        sql`INSERT INTO users (username, password, user_type, email, mobile_number, credits, soul_energy, email_notifications_enabled, is_active)
        VALUES (${row.username}, ${universalHash}, 'healer', ${row.email ?? null}, ${row.phone ?? null}, 100, 0, true, true)
        ON CONFLICT (username) DO NOTHING`
      );
      orphanFixed++;
    }

    if (orphanFixed > 0) {
      console.log(`✅ Fixed ${orphanFixed} healers missing from users table`);
    }

    // ── 4. Final counts ───────────────────────────────────────────────────────
    const uc = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    const hc = await db.execute(sql`SELECT COUNT(*) as count FROM healers`);
    console.log(`🌱 DB ready: ${uc.rows[0]?.count} users, ${hc.rows[0]?.count} healers — all passwords set to healer123`);

  } catch (error) {
    console.error("❌ Startup seed failed:", error);
  }
}
