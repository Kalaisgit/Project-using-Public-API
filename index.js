import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
app.use(express.static("public"));

const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));

const API_Key_Geo = "d91ada6a9e6501fd6760782579d1a50a";
const API_Key_weather = "b5cfebb408377f4b634797e36553ce82";

const Geo_API = "http://api.openweathermap.org/geo/1.0/direct";
const weather_API = "http://api.openweathermap.org/data/2.5/forecast";

const limit = 5;

//opening page
app.get("/", (req, res) => {
  res.render("index.ejs", {
    latitude: "",
    longitude: "",
    temperature: "",
    weather: "",
    visibility: "",
    wind_speed: "",
    alert_description: "",
    city: "",
    zone_time: "",
    population: "",
  });
});

app.post("/", async (req, res) => {
  //getting latitude and longitude

  try {
    const URL = Geo_API + `?q=${req.body.city}&limit=5&appid=${API_Key_Geo}`;
    console.log(`GEO position URL : ${URL}`);
    const response = await axios.get(URL);
    if (response.data.length > 0) {
      const result = response.data[0]; // Access the first object in the array
      const latitude = result.lat;
      const longitude = result.lon;

      // Fetch weather data using the latitude and longitude
      const weatherURL =
        weather_API +
        `?lat=${latitude}&lon=${longitude}&appid=${API_Key_weather}`;
      console.log(`Weather API URL : ${weatherURL}`);
      const weatherResponse = await axios.get(weatherURL);

      if (weatherResponse.data) {
        const answer = weatherResponse.data;
        const object = answer.list[0];
        res.render("index.ejs", {
          latitude: latitude,
          longitude: longitude,
          temperature: object.main.temp,
          weather: object.weather[0].main,
          visibility: object.visibility,
          wind_speed: object.wind.speed,
          alert_description: object.weather[0].description,
          city: answer.city.name,
          zone_time: answer.city.timezone,
          population: answer.city.population,
          error: null,
        });
      }
    } else {
      throw new Error("No data found for the specified city.");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.render("index.ejs", {
      latitude: null,
      longitude: null,
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
