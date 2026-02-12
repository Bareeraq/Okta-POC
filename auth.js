const oktaAuth = new OktaAuth({
    issuer: "https://integrator-9091209.okta.com/oauth2/default",
    clientId: "0oa1024dsa3zzVfbC698",
    redirectUri: "http://localhost:5500/home.html",
    scopes: ["openid", "profile", "email"],
    tokenManager: {
    storage: 'localStorage'
  }
});
function attachLoginHandler() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            console.log('Login button clicked');
            try {
                await oktaAuth.signInWithRedirect();
            } catch (err) {
                console.error('Login error:', err);
            }
        });
    }
}

// const oktaAuth = new OktaAuth({
//     issuer: "https://inadev-integrator-9091209.okta.com",
//     clientId: "0oazzri91lyvXY9DV697",
//     redirectUri: "http://localhost:5500/home.html",
//     scopes: ["openid", "profile", "email"]
// });