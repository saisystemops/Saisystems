/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createServerClient } = await import("@/lib/supabase");
      const supabase = createServerClient();
      
      const { data, error } = await supabase
        .from("referrals")
        .select(`
          id,
          referred_type,
          outcome,
          reward_paid,
          commission_percent,
          commission_amount,
          created_at,
          referrer:contacts!referrer_id(name),
          referred:contacts!referred_id(name, city)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      const parsed = (data || []).map((r: any) => ({
        id: r.id,
        referrerName: r.referrer?.name || "Unknown",
        referredName: r.referred?.name || "Unknown",
        referredType: r.referred_type || "other",
        city: r.referred?.city || "India",
        date: r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : "",
        outcome: r.outcome || "pending",
        commissionPercent: Number(r.commission_percent || 0),
        commissionAmount: Number(r.commission_amount || 0),
        rewardPaid: Boolean(r.reward_paid),
      }));

      return NextResponse.json({ success: true, data: parsed });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error("Fetch referrals error:", error);
    return NextResponse.json({ success: false, message: "Fetch failed." }, { status: 500 });
  }
}
