//protect page for single role
async function protectPage(roleRequired) {
    const user = await oktaAuth.getUser();

    if (!user || !user.groups || !user.groups.includes(roleRequired)) {
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


//auto redirect after login
async function redirectUserByRole() {

    const user = await oktaAuth.getUser();

    if (!user || !user.groups || user.groups.length === 0) {
        window.location.href = "unauthorized.html";
        return;
    }

    const groups = user.groups;

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

    document.body.style.display = "none";

}

function attachLogoutHandler(buttonId = "logoutBtn") {

    const btn = document.getElementById(buttonId);

    if (!btn) return;

    btn.onclick = async () => {
        await oktaAuth.signOut();
        window.location.href = "index.html";
    };
}
