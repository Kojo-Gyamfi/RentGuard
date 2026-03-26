export async function sendNotification(
  userId: string, 
  title: string, 
  message: string, 
  type: "EMAIL" | "SMS"
) {
  // In a real production application, this would integrate with Resend, Sendgrid, or Twilio.
  // For the purpose of this project, we console.log the notification to simulate it.
  
  console.log(`[NOTIFICATION SYSTEM - ${type}]`);
  console.log(`To User ID: ${userId}`);
  console.log(`Title: ${title}`);
  console.log(`Message: ${message}`);
  console.log(`--------------------------------------------------`);

  // Simulate a network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return { success: true };
}
