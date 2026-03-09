const oktaAuth = new OktaAuth({
    issuer: "https://integrator-9091209.okta.com/oauth2/default",
    clientId: "0oa1024dsa3zzVfbC698",
    redirectUri: "http://localhost:5500/home.html",
    scopes: ["openid", "profile", "email"],
    tokenManager: { storage: "localStorage" }
});

// ─── Login ────────────────────────────────────────────────────────────────────
function attachLoginHandler() {
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", async () => {
            try {
                await oktaAuth.signInWithRedirect();
            } catch (err) {
                console.error("Login error:", err);
            }
        });
    }
}

// ─── Logout ───────────────────────────────────────────────────────────────────
function attachLogoutHandler(buttonId = "logoutBtn") {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    btn.onclick = async () => {
        await oktaAuth.signOut();
        window.location.href = "index.html";
    };
}

// ─── Authorization Check ──────────────────────────────────────────────────────
// Call on every protected page to verify session + role
async function checkAuthAndRole(requiredRoles = []) {

    // 1. Handle redirect if returning from Okta
    if (oktaAuth.isLoginRedirect()) {
        await oktaAuth.handleLoginRedirect();
    }

    // 2. Check session
    const isAuthenticated = await oktaAuth.isAuthenticated();
    if (!isAuthenticated) {
        console.warn("Not authenticated — redirecting to login.");
        window.location.href = "index.html";
        return null;
    }

    // 3. Get user + validate token expiry
    let user;
    try {
        const tokenObj = await oktaAuth.tokenManager.get("accessToken");

        if (!tokenObj) {
            throw new Error("No access token found.");
        }

        const now = Math.floor(Date.now() / 1000);
        if (tokenObj.expiresAt && tokenObj.expiresAt < now) {
            console.warn("Token expired — attempting silent renew...");
            await oktaAuth.tokenManager.renew("accessToken");
        }

        user = await oktaAuth.getUser();

    } catch (err) {
        console.error("Auth check failed:", err);
        await oktaAuth.signOut();
        window.location.href = "index.html";
        return null;
    }

    // 4. Role check
    if (requiredRoles.length > 0) {
        const userGroups = user.groups || [];
        const hasRole = requiredRoles.some(role => userGroups.includes(role));

        if (!hasRole) {
            console.warn(`Access denied. User groups: ${userGroups}, Required: ${requiredRoles}`);
            window.location.href = "unauthorized.html";
            return null;
        }
    }

    console.log("Auth check passed for:", user.email, "| Groups:", user.groups);
    return user;                                                                        // return user object for use on the page
}