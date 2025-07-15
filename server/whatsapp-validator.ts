import https from 'https';

interface WhatsAppValidationResult {
  isValid: boolean;
  hasWhatsApp: boolean;
  message?: string;
}

export async function validateWhatsAppNumber(phoneNumber: string): Promise<WhatsAppValidationResult> {
  return new Promise((resolve) => {
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Ensure number has country code
    let formattedNumber = cleanNumber;
    if (!formattedNumber.startsWith('+')) {
      // Add + if not present
      formattedNumber = '+' + formattedNumber;
    }
    
    const payload = JSON.stringify({
      phone_numbers: [formattedNumber]
    });

    const options = {
      hostname: 'whatsapp-number-validator3.p.rapidapi.com',
      port: 443,
      path: '/WhatsappNumberHasItBulkWithToken',
      method: 'POST',
      headers: {
        'x-rapidapi-key': '11de2cdf66msh503d4cc930be103p1ccbdfjsn609d5f9e5cff',
        'x-rapidapi-host': 'whatsapp-number-validator3.p.rapidapi.com',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('WhatsApp validation response:', response);
          
          // Check if the response indicates the number has WhatsApp
          if (response && response.results && response.results.length > 0) {
            const result = response.results[0];
            const hasWhatsApp = result.has_whatsapp === true || result.status === 'valid';
            
            resolve({
              isValid: true,
              hasWhatsApp: hasWhatsApp,
              message: hasWhatsApp ? 'Number has WhatsApp' : 'Number does not have WhatsApp'
            });
          } else {
            resolve({
              isValid: false,
              hasWhatsApp: false,
              message: 'Unable to validate number'
            });
          }
        } catch (error) {
          console.error('Error parsing WhatsApp validation response:', error);
          // If validation fails, allow the number (fallback)
          resolve({
            isValid: true,
            hasWhatsApp: true,
            message: 'Validation service unavailable, proceeding with number'
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error('WhatsApp validation request error:', error);
      // If validation fails, allow the number (fallback)
      resolve({
        isValid: true,
        hasWhatsApp: true,
        message: 'Validation service unavailable, proceeding with number'
      });
    });

    req.write(payload);
    req.end();
  });
}