// //login
// document.addEventListener("DOMContentLoaded", () => {

//     const loginBtn = document.getElementById("loginBtn");

//     if (!loginBtn) {
//         console.error("Login button not found");
//         return;
//     }

//     loginBtn.addEventListener("click", async () => {
//         console.log("Login button clicked");
//         await oktaAuth.signInWithRedirect();
//     });

// });


// //handle redirect after Okta login
// async function handleLogin() {          //token endpoint exch
//   if (oktaAuth.isLoginRedirect()) {
//     await oktaAuth.handleLoginRedirect();
//     window.location.href = "home.html";
//   }
// }

// handleLogin();

console.log("App initialized");