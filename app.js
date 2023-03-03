const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (error) {
    console.log(`DB Error ${error.message}`);
  }
};

initializeDbAndServer();

//API1
const convertDBObject = (objectItem) => {
  return {
    movieName: objectItem.movie_name,
  };
};
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `select * from movie;`;
  const getMoviesQueryResponse = await db.all(getMoviesQuery);
  response.send(
    getMoviesQueryResponse.map((eachItem) => convertDBObject(eachItem))
  );
});

//API2
//Creates a new movie in the movie table. `movie_id` is auto-incremented
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `insert into movie(director_id,movie_name,lead_actor)
    values(${directorId},'${movieName}','${leadActor}');`;
  const postMovieQueryResponse = await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

//API3
//Returns a movie based on the movie ID
const convertDBObject3 = (objectItem) => {
  return {
    movieId: objectItem.movie_id,
    directorId: objectItem.director_id,
    movieName: objectItem.movie_name,
    leadActor: objectItem.lead_actor,
  };
};
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMoviesQuery = `select * from movie where movie_id=${movieId};`;
  const getMoviesQueryResponse = await db.get(getMoviesQuery);
  response.send(convertDBObject3(getMoviesQueryResponse));
});

//API4
//Updates the details of a movie in the movie table based on the movie ID
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const putMovieQuery = `update movie set 
    director_id=${directorId},movie_name='${movieName}',lead_actor='${leadActor}'
    where movie_id=${movieId};`;
  const putMovieQueryResponse = await db.run(putMovieQuery);
  response.send("Movie Details Updated");
});

//API5
//Deletes a movie from the movie table based on the movie ID
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const delMovieQuery = `delete from movie where movie_id=${movieId};`;
  const delMovieQueryResponse = await db.run(delMovieQuery);
  response.send("Movie Removed");
});

//API6
//Returns a list of all directors in the director table
const convertDBObject6 = (objectItem) => {
  return {
    directorId: objectItem.director_id,
    directorName: objectItem.director_name,
  };
};
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `select * from director;`;
  const getDirectorQueryResponse = await db.all(getDirectorQuery);
  response.send(
    getDirectorQueryResponse.map((eachItem) => convertDBObject6(eachItem))
  );
});

//API7
//Returns a list of all movie names directed by a specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesQuery = `select movie_name as movieName from movie where director_id=${directorId};`;
  const getMoviesQueryResponse = await db.all(getMoviesQuery);
  response.send(getMoviesQueryResponse);
});

module.exports = app;
