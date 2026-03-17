import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jwtVerify } from "https://esm.sh/jose@5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiter (untuk development)
// Untuk production, gunakan Deno KV atau database eksternal
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset window (5 menit)
    rateLimitStore.set(userId, { count: 1, resetTime: now + 5 * 60 * 1000 });
    return true;
  }

  // Maksimal 50 requests per 5 menit
  if (userLimit.count >= 50) {
    return false;
  }

  userLimit.count++;
  return true;
}

async function verifyToken(req: Request): Promise<{ userId: string; isValid: boolean }> {
  try {
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { userId: "", isValid: false };
    }

    const token = authHeader.slice(7); // Remove "Bearer "
    
    // Verifikasi token menggunakan Supabase JWT secret
    const secret = new TextEncoder().encode(
      Deno.env.get("SUPABASE_JWT_SECRET") || ""
    );

    try {
      const verified = await jwtVerify(token, secret);
      const userId = verified.payload.sub as string;
      return { userId, isValid: true };
    } catch (_error) {
      return { userId: "", isValid: false };
    }
  } catch (_error) {
    return { userId: "", isValid: false };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Verifikasi JWT token
    const { userId, isValid } = await verifyToken(req);
    
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - valid token required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. Check rate limit berdasarkan user ID
    if (!checkRateLimit(userId)) {
      return new Response(
        JSON.stringify({ error: "Too many requests - rate limit exceeded" }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { productId } = await req.json();
    if (!productId) {
      return new Response(JSON.stringify({ error: "Missing productId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify product is free and published
    const { data: product, error: prodErr } = await supabaseAdmin
      .from("products")
      .select("file_url, is_free, is_published")
      .eq("id", productId)
      .single();

    if (prodErr || !product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!product.is_free) {
      return new Response(JSON.stringify({ error: "This product requires purchase" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!product.is_published) {
      return new Response(JSON.stringify({ error: "Product not available" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!product.file_url) {
      return new Response(JSON.stringify({ error: "No file available" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract storage path from the full URL
    const url = new URL(product.file_url);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/products\/(.+)/);
    if (!pathMatch) {
      return new Response(JSON.stringify({ error: "Invalid file path" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const filePath = decodeURIComponent(pathMatch[1]);

    // Generate a short-lived signed URL (5 minutes)
    const { data: signedData, error: signErr } = await supabaseAdmin.storage
      .from("products")
      .createSignedUrl(filePath, 300);

    if (signErr || !signedData?.signedUrl) {
      return new Response(JSON.stringify({ error: "Failed to generate download link" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ url: signedData.signedUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});