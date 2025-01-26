export const assembleProvider = {
  baseUrl: 'https://api.assemble-insurance.com',
  
  verifyMembership: async (membershipNumber: string) => {
    // Implementation for Assemble's API
    const response = await fetch(`${assembleProvider.baseUrl}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ASSEMBLE_API_KEY}`,
      },
      body: JSON.stringify({ membershipNumber }),
    });
    return response.json();
  },

  submitClaim: async (claimData: any) => {
    // Implementation for Assemble's claim submission
    const response = await fetch(`${assembleProvider.baseUrl}/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ASSEMBLE_API_KEY}`,
      },
      body: JSON.stringify(claimData),
    });
    return response.json();
  }
};