export const generateHeaders = (clientId) => ({
  "Content-Type": "application/x-www-form-urlencoded",
  "X-MAL-Client-ID": process.env.CLIENT_ID,
  Authorization: `Bearer ${clientId}`,
});

export const getSecondsWatched = (anime) => {
  const info = anime.node;
  const duration = info.average_episode_duration;
  let epsWatched = info.my_list_status.num_episodes_watched;

  if (info.my_list_status.is_rewatching)
    epsWatched +=
      info.num_episodes * (info.my_list_status.num_times_rewatched + 1);

  return duration * epsWatched;
};

export const animeStatusEnumConverter = (status) => {
  switch (status) {
    case "watching":
      return "Watching";
    case "completed":
      return "Completed";
    case "on_hold":
      return "On Hold";
    case "dropped":
      return "Dropped";
    case "plan_to_watch":
      return "Plan To Watch";
  }
};

export const mangaStatusEnumConverter = (status) => {
  switch (status) {
    case "reading":
      return "Reading";
    case "completed":
      return "Completed";
    case "on_hold":
      return "On Hold";
    case "dropped":
      return "Dropped";
    case "plan_to_read":
      return "Plan To Read";
  }
};

export const ratingEnumConverter = (rating) => {
  switch (rating) {
    case "g":
      return "G";
    case "pg":
      return "PG";
    case "pg_13":
      return "PG-13";
    case "r":
      return "R";
    case "r+":
      return "R+";
    case "rx":
      return "RX";
    default:
      return "None";
  }
};
