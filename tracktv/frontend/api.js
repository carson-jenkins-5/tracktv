async function handleAuth() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!(username && password)) {
        alert("Please enter a username and password.");
        return;
    }

    const isSignup = document.getElementById("auth-title").textContent === "Sign Up";
    const endpoint = isSignup ? "/backend/signup" : "/backend/watchlist"; // Use an existing authenticated endpoint for login

    try {
        const response = await fetch(endpoint, {
            method: isSignup ? "POST" : "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Basic " + btoa(username + ":" + password)
            },
            body: isSignup ? JSON.stringify({ username, password }) : null
        });

        const data = await response.json();
        console.log("Auth response:", response.status, data);

        if (response.ok) {
            console.log("Saving credentials...");
            sessionStorage.setItem("username", username);
            sessionStorage.setItem("password", password);
            console.log("Stored Username:", sessionStorage.getItem("username"));
            console.log("Stored Password:", sessionStorage.getItem("password"));
            if (username === "admin" && password === "adminpass") {
                window.location.href = "admin.html";
                return;
            }
            window.location.reload(true);
        } else {
            alert("Authentication failed: " + (data.error || "Unknown error"));
        }
    } catch (error) {
        console.error("Error during authentication:", error);
        alert("Network error. Try again.");
    }
}