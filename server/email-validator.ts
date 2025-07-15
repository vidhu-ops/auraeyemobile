import axios from 'axios';

interface EmailValidationResult {
  isValid: boolean;
  message: string;
  deliverability: string;
  qualityScore: number;
}

export async function validateEmailAddress(email: string): Promise<EmailValidationResult> {
  const apiKey = 'b15aa6356ba141cda298c00644d48855';
  
  try {
    console.log(`\n=== EMAIL VALIDATION ===`);
    console.log(`Validating email: ${email}`);
    
    const response = await axios.get(`https://emailvalidation.abstractapi.com/v1/`, {
      params: {
        api_key: apiKey,
        email: email
      },
      timeout: 5000 // 5 second timeout
    });
    
    const data = response.data;
    console.log('Email validation response:', data);
    
    // Extract validation results
    const isValid = data.deliverability === 'DELIVERABLE' && data.is_valid_format?.value === true;
    const deliverability = data.deliverability || 'UNKNOWN';
    const qualityScore = data.quality_score || 0;
    
    let message = '';
    if (isValid) {
      message = 'Email is valid and deliverable';
    } else if (data.deliverability === 'UNDELIVERABLE') {
      message = 'Email address is not deliverable';
    } else if (data.is_valid_format?.value === false) {
      message = 'Email format is invalid';
    } else if (data.is_disposable_email?.value === true) {
      message = 'Disposable email addresses are not allowed';
    } else if (data.is_role_email?.value === true) {
      message = 'Role-based email addresses are not recommended';
    } else {
      message = 'Email validation inconclusive';
    }
    
    console.log(`Validation result: ${isValid ? 'VALID' : 'INVALID'} - ${message}`);
    console.log(`========================\n`);
    
    return {
      isValid,
      message,
      deliverability,
      qualityScore
    };
    
  } catch (error) {
    console.error('Email validation error:', error);
    console.log('Email validation failed, allowing registration to proceed');
    console.log(`========================\n`);
    
    // Fallback: allow registration if validation service fails
    return {
      isValid: true,
      message: 'Email validation service unavailable - proceeding with registration',
      deliverability: 'UNKNOWN',
      qualityScore: 0
    };
  }
}