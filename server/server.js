require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ origin: ["http://localhost:5500", "http://127.0.0.1:5500"] }));

const OKTA_DOMAIN = process.env.OKTA_DOMAIN;
const OKTA_TOKEN = process.env.OKTA_API_TOKEN;

const ROLE_GROUP_MAP = {
    "Rater":    process.env.GROUP_ID_RATER,
    "Reviewer": process.env.GROUP_ID_REVIEWER,
    "Client":   process.env.GROUP_ID_CLIENT,
};

console.log("ENV CHECK:");
console.log("OKTA_DOMAIN:", OKTA_DOMAIN);
console.log("OKTA_TOKEN set:", !!OKTA_TOKEN);
console.log("GROUP_RATER:", process.env.GROUP_ID_RATER);
console.log("GROUP_REVIEWER:", process.env.GROUP_ID_REVIEWER);
console.log("GROUP_CLIENT:", process.env.GROUP_ID_CLIENT);

app.post("/api/register", async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;
    console.log("Registration attempt:", { firstName, lastName, email, role });

    if (!ROLE_GROUP_MAP[role]) {
        return res.status(400).json({ error: "Invalid role selected." });
    }

    try {
        //create user WITHOUT activating
        const createRes = await fetch(`${OKTA_DOMAIN}/api/v1/users?activate=false`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `SSWS ${OKTA_TOKEN}`,
                "Accept": "application/json"
            },
            body: JSON.stringify({
                profile: {
                    firstName,
                    lastName,
                    email,
                    login: email
                },
                credentials: {
                    password: { value: password }
                }
            })
        });

        const newUser = await createRes.json();
        console.log("Create status:", createRes.status);
        console.log("Create response:", JSON.stringify(newUser, null, 2));

        if (!createRes.ok) {
            const errMsg = newUser.errorCauses?.[0]?.errorSummary || newUser.errorSummary || "Failed to create user.";
            return res.status(400).json({ error: errMsg });
        }

        const userId = newUser.id;

        //activate WITHOUT sending email
        const activateRes = await fetch(`${OKTA_DOMAIN}/api/v1/users/${userId}/lifecycle/activate?sendEmail=false`, {
            method: "POST",
            headers: {
                "Authorization": `SSWS ${OKTA_TOKEN}`,
                "Accept": "application/json"
            }
        });

        const activateData = await activateRes.json();
        console.log("Activate status:", activateRes.status);
        console.log("Activate response:", JSON.stringify(activateData, null, 2));

        //assign to role group
        const groupRes = await fetch(`${OKTA_DOMAIN}/api/v1/groups/${ROLE_GROUP_MAP[role]}/users/${userId}`, {
            method: "PUT",
            headers: {
                "Authorization": `SSWS ${OKTA_TOKEN}`,
                "Accept": "application/json"
            }
        });

        console.log("Group assignment status:", groupRes.status);

        if (!groupRes.ok) {
            return res.status(207).json({ warning: "Account created but role assignment failed. Contact admin." });
        }

        return res.status(201).json({ message: "User registered successfully." });

    } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));