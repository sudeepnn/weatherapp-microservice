const express=require('express');
const axios=require('axios');
const mongoose=require('mongoose');
require('dotenv').config()

const app = express();
const port=process.env.PORT 

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
     useUnifiedTopology: true})
     .then(() => console.log('Connected to mongodb'))
     .catch((err)=>console.log(err))


     const weatherschema=new mongoose.Schema({
        temp: Number,
        feels_like: Number,
        temp_min: Number,
        temp_max: Number,
        pressure: Number,
        humidity: Number,
        sea_level: Number,
        grnd_level: Number
    })

    const Weather=mongoose.model('weather', weatherschema)


    app.get('/weather', async (req, res) =>{
        try {
            const apiKey = process.env.weatherapi;  // Your OpenWeatherMap API key
            const city = req.query.city;  // Get the city from query parameter
            
            // Check if city is provided in the query
            if (!city) {
              return res.status(400).json({ error: 'Please provide a city name' });
            }
        
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
            
            // Fetch weather data
            const response = await axios.get(weatherUrl);
            // console.log(response);
            // Extract the 'weather' data from the response
            const weatherData = response.data.main; // Extract only the first weather object
            // console.log(weatherData);
            // Create a new weather document from the fetched data
            const newWeather = new Weather({
                temp: weatherData.temp,
                feels_like: weatherData.feels_like,
                temp_min: weatherData.temp_min,
                temp_max: weatherData.temp_max,
                pressure: weatherData.pressure,
                humidity: weatherData.humidity,
                sea_level:  weatherData.sea_level,
                grnd_level: weatherData.grnd_level
            });
        
            // Save the weather data to MongoDB
            await newWeather.save();
        
            res.json({
              message: 'Weather data saved successfully!',
              weatherData: newWeather
            });
          } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch or save weather data' });
          }
    })

app.listen(port, ()=>console.log(`listening on port ${port}`))