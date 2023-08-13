const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
let db = null;
const dBpath = path.join(__dirname, "covid19India.db");
const initializeDBandserver = async () => {
  try {
    db = await open({
      filename: dBpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://locathost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDBandserver();

const convertstateDbObjectToResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

app.get("/states/", async (request, response) => {
  const stateListQuery = `SELECT state_id AS stateId,state_name AS stateName,population FROM state ;`;
  const statelist = await db.all(stateListQuery);
  response.send(statelist);
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const stateListQuery = `SELECT state_id AS stateId,state_name AS stateName,population 
  FROM state 
  WHERE state_id='${stateId}';`;
  const state = await db.get(stateListQuery);
  response.send(state);
});

app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const addDrctrictQuery = `INSERT INTO district (district_name,state_id,cases,cured,active,deaths) VALUES ${districtName},${stateId},${cases},${cured},${active},${deaths};`;
  const adddistrictDetails = await db.run(addDrctrictQuery);
  response.send("District Successfully Added");
});

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtListQuery = `SELECT district_id AS districtId,district_name AS districtName,state_id AS stateId,cases,cured,active,deaths 
  FROM district 
  WHERE district_id=${districtId};`;
  const district = await db.get(districtListQuery);
  response.send(district);
});

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtListQuery = `DELETE  
  FROM district 
  WHERE district_id=${districtId};`;
  await db.run(districtListQuery);
  response.send("District Removed");
});
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateMovieQuery = `
            UPDATE
              discrict
            SET
                district_name=${districtName},
                state_id=${stateId},
                cases=${cases},
                cured=${cured},
                active=${active},
                deaths=${deaths},
            WHERE
              district_id = ${districtId};`;
  await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const stateListQuery = `SELECT SUM(cases),SUM(cured),SUM(active),SUM(deaths) 
  FROM district 
  WHERE state_id='${stateId}';`;
  const stats = await db.get(stateListQuery);
  console.log(stats);
  response.send({
    totalCases: stats["SUM(cases)"],
    totalCured: stats["SUM(cured)"],
    totalActive: stats["SUM(active)"],
    totalDeaths: stats["SUM(deaths)"],
  });
});

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `
    select state_id from district
    where district_id = ${districtId}; `;
  const getDistrictIdQueryResponse = await db.get(getDistrictIdQuery);
  const getStateNameQuery = `
    select state_name  as stateName from state
    where state_id = ${getDistrictIdQueryResponse.state_id}; `;
  const getStateNameQueryResponse = await db.get(getStateNameQuery);
  response.send(getStateNameQueryResponse);
});

module.exports = app;
