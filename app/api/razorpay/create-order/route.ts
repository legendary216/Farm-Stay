import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    // 1. Receive the dynamic amount from your frontend (1500 or 3000)
    const { amount } = await request.json();

    // 2. Initialize the Razorpay secure client using your hidden Server Keys
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // 3. Create the order configuration
    // Razorpay strictly requires the amount to be in the smallest currency sub-unit (paise).
    // So ₹1,500 becomes 150000.
    const options = {
      amount: amount * 100, 
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    };

    // 4. Ask Razorpay's servers to generate the Order ID
    const order = await razorpay.orders.create(options);

    // 5. Send the safe Order ID back to your frontend
    return NextResponse.json({ order }, { status: 200 });

  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    return NextResponse.json(
      { error: "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}