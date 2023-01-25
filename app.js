const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(4000, () => {
      console.log("server is running at http://localhost:4000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getQuery = `
    SELECT * FROM cricket_team;`;
  const booksArray = await db.all(getQuery);
  let myArr = [];
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };
  for (let each of booksArray) {
    let a = convertDbObjectToResponseObject(each);
    myArr.push(a);
  }
  response.send(myArr);
});

//post
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayer = `
    INSERT INTO cricket_team
    (player_name,jersey_number,role)
    VALUES
    ("${playerName}",${jerseyNumber},
    "${role}");`;
  const dpResponse = await db.run(addPlayer);
  const playerId = dpResponse.lastID;
  response.send("Player Added to Team");
});

//get specific
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getQuery1 = `
        SELECT * FROM cricket_team 
        WHERE player_id=${playerId};`;
  const dbRes = await db.get(getQuery1);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };
  let ab = convertDbObjectToResponseObject(dbRes);
  response.send(ab);
});

//PUT
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
    UPDATE 
        cricket_team
    SET
        player_name='${playerName}',
        jersey_number=${jerseyNumber},
        role='${role}'
    WHERE 
        player_id=${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//DELETE
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM 
        cricket_team
    WHERE
        player_id=${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
