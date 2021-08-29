import express from "express";
import axios from "axios";
import path from "path";
import fs from "fs";
import { Cache } from "memory-cache";
import {
  generateHeaders,
  getSecondsWatched,
  ratingEnumConverter,
  animeStatusEnumConverter,
  mangaStatusEnumConverter,
  getChaptersRead,
  getVolumesRead,
} from "../helpers.js";

const userCache = new Cache();
const animeCache = new Cache();
const mangaCache = new Cache();

const PAGE_LIMIT = 1000;
const __dirname = path.resolve();

export const router = express.Router();

// Default
router.get("/", async (req, res) => {
  return res.status(200).send("OK");
});

// Get Image
router.get("/chord-logo", async (req, res) => {
  return res.status(200).sendFile(path.join(__dirname, "assets/MAL-Chord.png"));
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
    console.error("/access_token", err);
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
    console.error("/refresh_token", err);
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
    console.error("/user_details", err);
    return res.status(500).json(err);
  }
});

// Get Mock user details
router.post("/mock_details", async (req, res) => {
  return res.status(200).json({
    name: "Guest",
    memberSince: new Date(),
  });
});

// Get Anime/List Details
router.post("/user_anime_list", async (req, res) => {
  const userToken = req.body.userToken;
  const page = req.body.page;

  const existingCache = animeCache.get(userToken);

  // Empty large cache
  if (animeCache.size() >= 50) animeCache.clear();

  // Check cache
  if (existingCache && !existingCache.hasNextPage)
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
      status: animeStatusEnumConverter(anime.node.my_list_status.status),
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
    console.error("/user_anime_list", err);
    return res.status(500).json(err);
  }
});

// Get Mock anime list
router.post("/mock_anime_list", async (req, res) => {
  const animeList = fs.readFileSync(
    path.join(__dirname, "/mocks/mockAnimeList.json")
  );

  return res.status(200).json({
    data: JSON.parse(animeList),
    hasNextPage: false,
  });
});

// Get Manga List details
router.post("/user_manga_list", async (req, res) => {
  const userToken = req.body.userToken;
  const page = req.body.page;

  const existingCache = mangaCache.get(userToken);

  // Empty large cache
  if (mangaCache.size() >= 50) mangaCache.clear();

  // Check cache
  if (existingCache && !existingCache.hasNextPage)
    return res.status(200).json(existingCache);

  try {
    const response = await axios.get(
      `https://api.myanimelist.net/v2/users/@me/mangalist?limit=${PAGE_LIMIT}&offset=${
        PAGE_LIMIT * ((page ?? 1) - 1)
      }sort=list_updated_at&fields=genres,authors{first_name,last_name},rank,popularity,num_chapters,num_volumes,my_list_status{num_times_reread,is_rereading,num_chapters_read,num_volumes_read},alternative_titles`,
      {
        headers: generateHeaders(userToken),
      }
    );

    // Transform response
    const formattedData = response.data.data.map((manga) => ({
      id: manga.node.id,
      title: manga.node.alternative_titles.en || manga.node.title,
      chaptersRead: getChaptersRead(manga),
      volumesRead: getVolumesRead(manga),
      genres: manga.node.genres.map((genre) => genre.name),
      image: manga.node.main_picture.medium,
      status: mangaStatusEnumConverter(manga.node.my_list_status.status),
      score: manga.node.my_list_status.score,
      lastUpdated: manga.node.my_list_status.updated_at,
      popularity: manga.node.popularity,
      rank: manga.node.rank,
      authors: manga.node.authors.map((author) =>
        [author.node.first_name, author.node.last_name?.toUpperCase()].join(" ")
      ),
    }));

    const formattedResponse = {
      data: [...(existingCache?.data ?? []), ...formattedData],
      hasNextPage: !!response.data.paging?.next,
    };

    mangaCache.put(userToken, formattedResponse, 600000);

    return res.status(200).json(formattedResponse);
  } catch (err) {
    console.error("/user_manga_list", err);
    return res.status(500).json(err);
  }
});

// Get Mock manga list
router.post("/mock_manga_list", async (req, res) => {
  const mangaList = fs.readFileSync(
    path.join(__dirname, "/mocks/mockMangaList.json")
  );

  return res.status(200).json({
    data: JSON.parse(mangaList),
    hasNextPage: false,
  });
});
