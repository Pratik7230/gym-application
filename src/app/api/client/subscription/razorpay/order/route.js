import Razorpay from "razorpay";

import { ROLES } from "@/constants/roles.js";
import { requireAuth } from "@/lib/auth/session.js";
import { connectDB } from "@/lib/db.js";
import { AppError, jsonError } from "@/lib/errors.js";
import { computeCachedStatus } from "@/lib/subscription-status.js";
import Plan from "@/models/Plan.js";
import Subscription from "@/models/Subscription.js";
import { logActivity } from "@/services/activityLogService.js";
import { clientSubscriptionRazorpayOrderSchema } from "@/validators/client.js";

export const runtime = "nodejs";

function mapRazorpayError(error, fallbackMessage) {
  if (error instanceof AppError) return error;

  const statusCode = Number(error?.statusCode);
  const description = error?.error?.description || error?.description || error?.message;

  if (statusCode === 401) {
    return new AppError(
      "Razorpay authentication failed. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      502
    );
  }

  if (statusCode === 400) {
    return new AppError(description || fallbackMessage, 400);
  }

  if (description) {
    return new AppError(description, 502);
  }

  return new AppError(fallbackMessage, 502);
}

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new AppError("Razorpay is not configured", 503);
  }

  return {
    keyId,
    client: new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    }),
  };
}

export async function POST(request) {
  try {
    const { user } = await requireAuth(request, [ROLES.CLIENT]);
    const body = await request.json();
    const parsed = clientSubscriptionRazorpayOrderSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await connectDB();

    const existingSub = await Subscription.findOne({ user: user._id }).sort({ endDate: -1 }).lean();
    if (existingSub && computeCachedStatus(existingSub.endDate) !== "expired") {
      throw new AppError("You already have an active subscription", 409);
    }

    const plan = await Plan.findById(parsed.data.planId).lean();
    if (!plan || !plan.isActive) {
      throw new AppError("Plan is not available", 400);
    }

    const amountInPaise = Math.round(Number(plan.price) * 100);
    if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
      throw new AppError("Invalid plan amount", 400);
    }

    const { client, keyId } = getRazorpayClient();
    const receipt = `c_${Date.now().toString(36)}_${String(user._id).slice(-8)}`;

    const order = await client.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        userId: String(user._id),
        planId: String(plan._id),
      },
    });

    await logActivity({
      actorId: user._id,
      action: "payment.order.create",
      resource: "payment",
      resourceId: String(order.id),
      metadata: {
        provider: "razorpay",
        userId: String(user._id),
        planId: String(plan._id),
        amount: plan.price,
        initiatedBy: "client",
      },
    });

    return Response.json({
      keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      customer: {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      },
      plan: {
        id: String(plan._id),
        name: plan.name,
        amount: plan.price,
        durationDays: plan.durationDays,
      },
    });
  } catch (e) {
    return jsonError(mapRazorpayError(e, "Unable to create Razorpay order"));
  }
}
