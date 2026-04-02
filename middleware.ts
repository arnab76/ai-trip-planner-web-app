import arcjet, { createMiddleware, tokenBucket } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const config = {
    // Matcher ignoring `/_next` and static files
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export const aj = arcjet({
    key: process.env.ARCJET_KEY!,
    characteristics: ["ip.src", "userId"], // Track requests by IP and userId
    rules: [
        tokenBucket({
            mode: "LIVE",
            refillRate: 5,
            interval: 10,
            capacity: 30,
        }),
    ],
});

// Create a middleware that runs Arcjet first, then Clerk
export default clerkMiddleware(async (auth, req) => {
    const decision = await aj.protect(req, { userId: "", requested: 5 });
    console.log("Arcjet decision", decision)

    if (decision.isDenied()) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
});
