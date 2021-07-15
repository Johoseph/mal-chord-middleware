import express from "express";
import axios from "axios";

export const router = express.Router();

// Get Access Token
router.post("/access_token", async (req, res) => {
  const response = await axios
    .post(
      "https://myanimelist.net/v1/oauth2/token",
      `client_id=${process.env.CLIENT_ID}&client_secret=${
        process.env.CLIENT_SECRET
      }&code=${req.body.code}&code_verifier=${
        req.body.codeVerifier
      }&grant_type=authorization_code&redirect_uri=${encodeURIComponent(
        req.body.redirectUri
      )}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .catch((err) => console.error(err));

  return res.status(200).json(response.data);
});

// Refresh access token
router.post("/refresh_token", async (req, res) => {
  const response = await axios
    .post(
      "https://myanimelist.net/v1/oauth2/token",
      `client_id=${process.env.CLIENT_ID}&client_secret=${
        process.env.CLIENT_SECRET
      }&refresh_token=${
        req.body.refreshToken
      }&grant_type=refresh_token&redirect_uri=${encodeURIComponent(
        "http://localhost:8080"
      )}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .catch((err) => console.error(err));

  return res.status(200).json(response.data);
});

// Get User Details
router.post("/user_details", async (req, res) => {
  const response = await axios
    .get("https://api.myanimelist.net/v2/users/@me", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-MAL-Client-ID": process.env.CLIENT_ID,
        Authorization: `Bearer ${req.body.userToken}`,
      },
    })
    .catch((err) => console.error(err));

  return res.status(200).json(response.data);
});
