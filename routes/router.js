import express from "express";
import axios from "axios";
import path from "path";
import { Cache } from "memory-cache";
import {
  generateHeaders,
  getSecondsWatched,
  ratingEnumConverter,
  statusEnumConverter,
} from "../helpers.js";

const userCache = new Cache();
const animeCache = new Cache();

const PAGE_LIMIT = 1000;

export const router = express.Router();

// Get Image
router.get("/chord-logo", async (req, res) => {
  return res.status(200).sendFile(path.resolve("assets/MAL-Chord.png"));
});

// Get Access Token
router.post("/access_token", async (req, res) => {
  try {
    const response = await axios.post(
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
    );

    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// Refresh access token
router.post("/refresh_token", async (req, res) => {
  try {
    const response = await axios.post(
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
    );

    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// Get User Details
router.post("/user_details", async (req, res) => {
  const userToken = req.body.userToken;

  // Empty large cache
  if (userCache.size() >= 100) userCache.clear();

  // Check cache
  if (userCache.get(userToken))
    return res.status(200).json(userCache.get(userToken));

  try {
    const response = await axios.get(
      "https://api.myanimelist.net/v2/users/@me",
      {
        headers: generateHeaders(userToken),
      }
    );

    const formattedResponse = {
      id: response.data.id,
      name: response.data.name,
      memberSince: response.data.joined_at,
      userImage: response.data.picture,
    };

    userCache.put(userToken, formattedResponse, 1200000);

    return res.status(200).json(formattedResponse);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// Get Anime/List Details
router.post("/user_anime_list", async (req, res) => {
  const userToken = req.body.userToken;
  const page = req.body.page;

  const existingCache = animeCache.get(userToken);

  // Empty large cache
  if (animeCache.size() >= 50) animeCache.clear();

  // Check cache
  if (existingCache && existingCache.data.length >= PAGE_LIMIT * page)
    return res.status(200).json(existingCache);

  try {
    const response = await axios.get(
      `https://api.myanimelist.net/v2/users/@me/animelist?limit=${PAGE_LIMIT}&offset=${
        PAGE_LIMIT * ((page ?? 1) - 1)
      }sort=list_updated_at&fields=genres,studios,rating,rank,popularity,average_episode_duration,num_episodes,my_list_status{num_times_rewatched},alternative_titles`,
      {
        headers: generateHeaders(userToken),
      }
    );

    // Transform response
    const formattedData = response.data.data.map((anime) => ({
      id: anime.node.id,
      title: anime.node.alternative_titles.en || anime.node.title,
      secondsWatched: getSecondsWatched(anime),
      genres: anime.node.genres.map((genre) => genre.name),
      image: anime.node.main_picture.medium,
      status: statusEnumConverter(anime.node.my_list_status.status),
      score: anime.node.my_list_status.score,
      lastUpdated: anime.node.my_list_status.updated_at,
      popularity: anime.node.popularity,
      rank: anime.node.rank,
      rating: ratingEnumConverter(anime.node.rating),
      studios: anime.node.studios.map((studio) => studio.name),
    }));

    const formattedResponse = {
      data: [...(existingCache?.data ?? []), ...formattedData],
      hasNextPage: !!response.data.paging?.next,
    };

    animeCache.put(userToken, formattedResponse, 600000);

    return res.status(200).json(formattedResponse);
  } catch (err) {
    return res.status(500).json(err);
  }
});
