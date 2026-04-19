"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

function loadRazorpayCheckoutScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Payment checkout is only available in browser"));
      return;
    }
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout"));
    document.body.appendChild(script);
  });
}

export default function ClientSubscriptionPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [buyingPlanId, setBuyingPlanId] = useState("");

  const loadSubscription = useCallback(async () => {
    const res = await fetch("/api/client/subscription", { credentials: "include" });
    const payload = await res.json();
    if (!res.ok) {
      throw new Error(payload.error || "Failed to load subscription");
    }
    setData(payload);
  }, []);

  useEffect(() => {
    loadSubscription().catch((e) => setError(e.message || "Failed to load subscription"));
  }, [loadSubscription]);

  async function buyPlan(plan) {
    setError("");
    setSuccess("");
    setBuyingPlanId(plan._id);

    try {
      await loadRazorpayCheckoutScript();

      const orderRes = await fetch("/api/client/subscription/razorpay/order", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan._id }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      const checkout = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "Iron Fitness",
        description: `${plan.name} membership`,
        prefill: {
          name: orderData.customer?.name || "",
          email: orderData.customer?.email || "",
          contact: orderData.customer?.phone || "",
        },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/client/subscription/razorpay/verify", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                planId: plan._id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            setSuccess("Subscription activated successfully.");
            await loadSubscription();
          } catch (e) {
            setError(e.message || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => setError("Payment cancelled"),
        },
      });

      checkout.on("payment.failed", (response) => {
        const message = response?.error?.description || "Payment failed";
        setError(message);
      });

      checkout.open();
    } catch (e) {
      setError(e.message || "Unable to start Razorpay checkout");
    } finally {
      setBuyingPlanId("");
    }
  }

  if (!data) return <p className="text-zinc-500">Loading…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Subscription</h1>
      {error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100">
          {success}
        </div>
      ) : null}
      {data.status === "expired" ? (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
          Your subscription has expired.
        </div>
      ) : null}
      {data.status === "expiring_soon" ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
          Expires in {data.remainingDays} day(s).
        </div>
      ) : null}
      {data.subscription ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="font-medium">{data.subscription.plan?.name}</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {new Date(data.subscription.startDate).toLocaleDateString()} —{" "}
            {new Date(data.subscription.endDate).toLocaleDateString()}
          </p>
          <p className="mt-2 text-sm">Status: {data.status}</p>
          <p className="text-sm">Remaining days: {data.remainingDays}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-zinc-600 dark:text-zinc-400">No subscription found. Choose a plan below to get started.</p>

          {Array.isArray(data.plans) && data.plans.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {data.plans.map((plan) => (
                <article
                  key={plan._id}
                  className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{plan.name}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        plan.isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                          : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {plan.isActive ? "Available" : "Unavailable"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {plan.durationDays} days • {plan.billingPeriod}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {plan.currency} {plan.price}
                  </p>
                  {plan.description ? (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{plan.description}</p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => buyPlan(plan)}
                    disabled={!plan.isActive || Boolean(buyingPlanId)}
                    className="mt-3 inline-flex rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:opacity-60 dark:disabled:bg-zinc-700"
                  >
                    {!plan.isActive
                      ? "Currently unavailable"
                      : buyingPlanId === plan._id
                        ? "Starting..."
                        : "Buy with Razorpay"}
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No plans are available right now. Please check again later.</p>
          )}

          <div>
            <Link
              href="/client/payments"
              className="inline-flex rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              View payment history
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
