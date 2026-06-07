import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    // 1. Receive the three variables from the frontend
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();
    
    // 2. Retrieve your highly confidential secret key
    const secret = process.env.RAZORPAY_KEY_SECRET!;

    // 3. Recreate the exact string that Razorpay used to generate their signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    // 4. Encrypt our string using the Node crypto module and your secret key
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    // 5. Mathematically compare our encryption with Razorpay's signature
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      return NextResponse.json({ verified: true }, { status: 200 });
    } else {
      return NextResponse.json({ verified: false, error: "Invalid signature" }, { status: 400 });
    }

  } catch (error) {
    console.error("Razorpay Verification Error:", error);
    return NextResponse.json(
      { error: "Internal server error during verification" },
      { status: 500 }
    );
  }
}