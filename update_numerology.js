// Script to recalculate and update existing numerology records with correct chart values
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Letter to number mapping based on the provided numerology chart
function letterToNumber(letter) {
  const letterMap = {
    'A': 1, 'I': 1, 'J': 1, 'Q': 1, 'Y': 1,
    'B': 2, 'K': 2, 'R': 2,
    'C': 3, 'G': 3, 'L': 3, 'S': 3,
    'D': 4, 'M': 4, 'T': 4,
    'E': 5, 'H': 5, 'N': 5, 'X': 5,
    'F': 6, 'O': 6, 'U': 6, 'V': 6, 'W': 6,
    'Z': 7,
    'P': 8
  };
  
  return letterMap[letter.toUpperCase()] || 0;
}

function reduceNumber(num) {
  // Master numbers are preserved
  if (num === 11 || num === 22 || num === 33) return num;
  while (num > 9) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
}

function calculateLifePath(date) {
  // Sum all digits from the birth date
  const digits = date.replace(/\D/g, '');
  let sum = 0;
  for (const digit of digits) {
    sum += parseInt(digit);
  }
  return reduceNumber(sum);
}

function calculateDestiny(fullName) {
  // Sum all letters in the full name using the numerology chart
  let sum = 0;
  for (const char of fullName.replace(/[^a-zA-Z]/g, '')) {
    sum += letterToNumber(char);
  }
  return reduceNumber(sum);
}

function calculateSoulUrge(fullName) {
  // Sum only vowels (A, E, I, O, U, Y) using the numerology chart
  let sum = 0;
  const vowels = 'AEIOUY';
  for (const char of fullName.replace(/[^a-zA-Z]/g, '')) {
    if (vowels.includes(char.toUpperCase())) {
      sum += letterToNumber(char);
    }
  }
  return reduceNumber(sum);
}

function calculatePersonality(birthDate) {
  // Decision-Making Chakra: Sum of all digits from the birth date
  const digits = birthDate.replace(/\D/g, '');
  let sum = 0;
  for (const digit of digits) {
    sum += parseInt(digit);
  }
  return reduceNumber(sum);
}

async function updateNumerologyRecords() {
  try {
    // Get all numerology records
    const result = await pool.query('SELECT id, name, birth_date FROM numerology_readings');
    
    console.log(`Found ${result.rows.length} numerology records to update`);
    
    for (const record of result.rows) {
      const { id, name, birth_date } = record;
      
      // Calculate correct values using new chart
      const lifePathNumber = calculateLifePath(birth_date);
      const destinyNumber = calculateDestiny(name);
      const soulUrgeNumber = calculateSoulUrge(name);
      const personalityNumber = calculatePersonality(birth_date);
      
      // Update the record
      await pool.query(
        `UPDATE numerology_readings 
         SET life_path_number = $1, 
             destiny_number = $2, 
             soul_urge_number = $3, 
             personality_number = $4
         WHERE id = $5`,
        [lifePathNumber, destinyNumber, soulUrgeNumber, personalityNumber, id]
      );
      
      console.log(`Updated record ${id}: ${name} (${birth_date})`);
      console.log(`  Life Path: ${lifePathNumber}, Destiny: ${destinyNumber}, Soul Urge: ${soulUrgeNumber}, Personality: ${personalityNumber}`);
    }
    
    console.log('All numerology records updated successfully!');
  } catch (error) {
    console.error('Error updating numerology records:', error);
  } finally {
    await pool.end();
  }
}

updateNumerologyRecords();