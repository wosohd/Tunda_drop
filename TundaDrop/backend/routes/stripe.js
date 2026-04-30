import express from "express";
import Stripe from "stripe";

const router = express.Router();

router.post("/create-payment-intent", async (req, res) => {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return res.status(500).json({
        success: false,
        message: "Stripe secret key is missing on the backend.",
      });
    }

    const stripe = new Stripe(stripeSecretKey);

    const {
      amount,
      currency = process.env.STRIPE_CURRENCY || "kes",
      orderReference,
      customer,
    } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount.",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount),
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderReference: orderReference || "",
        customerName: customer?.name || "",
        customerEmail: customer?.email || "",
        customerPhone: customer?.phone || "",
        customerAddress: customer?.address || "",
      },
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Stripe payment intent error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Unable to start card payment.",
    });
  }
});

export default router;