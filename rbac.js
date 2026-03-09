// Auto redirect after login
async function redirectUserByRole() {

    //Ensure tokens handled
    if (oktaAuth.isLoginRedirect()) {
        await oktaAuth.handleLoginRedirect();
    }

    //Ensure user is authenticated
    const isAuthenticated = await oktaAuth.isAuthenticated();

    if (!isAuthenticated) {
        window.location.href = "index.html";
        return;
    }

    //fetch user
    const user = await oktaAuth.getUser();
    const groups = user.groups || [];

    console.log("User Roles:", groups);

    if (groups.includes("Ops-admin")) {
        window.location.href = "ops-admin.html";
    }
    else if (groups.includes("Reviewer")) {
        window.location.href = "reviewer.html";
    }
    else if (groups.includes("Rater")) {
        window.location.href = "rater.html";
    }
    else if (groups.includes("Client")) {
        window.location.href = "client.html";
    }
    else {
        window.location.href = "unauthorized.html";
    }
}

async function protectPage(roleRequired) {

    if (!(await oktaAuth.isAuthenticated())) {
        window.location.href = "index.html";
        return;
    }

    const user = await oktaAuth.getUser();

    if (!user?.groups?.includes(roleRequired)) {
        window.location.href = "unauthorized.html";
    }
}


//protect page for multiple roles
async function protectPageMulti(rolesAllowed) {
    const user = await oktaAuth.getUser();

    if (!user || !user.groups) {
        window.location.href = "unauthorized.html";
        return;
    }

    const hasAccess = rolesAllowed.some(role =>
        user.groups.includes(role)
    );

    if (!hasAccess) {
        window.location.href = "unauthorized.html";
    }
}

//logout handler
function attachLogoutHandler(buttonId = "logoutBtn") {

    const btn = document.getElementById(buttonId);

    if (!btn) return;

    btn.onclick = async () => {
        await oktaAuth.signOut();
        window.location.href = "index.html";
    };
}
