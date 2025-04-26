import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, CircularProgress, TextField, IconButton } from '@mui/material';
import { Search } from '@mui/icons-material';
import axios from 'axios';
import './App.scss';

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  name: string;
  wind: {
    speed: number;
  };
}

function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [city, setCity] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
  const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

  const fetchWeatherData = async (searchCity: string) => {
    try {
      setLoading(true);
      setError('');
      console.log('API Key:', API_KEY); // API 키 확인
      console.log('Searching for city:', searchCity); // 검색 도시 확인
      
      const response = await axios.get(
        `${API_BASE_URL}/weather?q=${searchCity}&appid=${API_KEY}&units=metric`
      );
      console.log('API Response:', response.data); // API 응답 확인
      setWeather(response.data);
    } catch (err: any) {
      console.error('Error fetching weather:', err); // 에러 상세 정보 출력
      if (err.response) {
        // API 에러 응답이 있는 경우
        if (err.response.status === 404) {
          setError('도시를 찾을 수 없습니다.');
        } else if (err.response.status === 401) {
          setError('API 키가 유효하지 않습니다.');
        } else {
          setError(`에러가 발생했습니다: ${err.response.data.message || '알 수 없는 에러'}`);
        }
      } else {
        setError('날씨 정보를 가져오는 중 문제가 발생했습니다.');
      }
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeatherData(city);
    }
  };

  useEffect(() => {
    // 초기 로드시 서울 날씨 표시
    fetchWeatherData('Seoul');
  }, []);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          날씨 앱
        </Typography>

        <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="도시 이름을 입력하세요"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton type="submit">
                  <Search />
                </IconButton>
              ),
            }}
          />
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ my: 2 }}>
            {error}
          </Typography>
        )}

        {weather && !loading && (
          <Box sx={{ 
            p: 3, 
            borderRadius: 2,
            bgcolor: '#fff',
            boxShadow: 3
          }}>
            <Typography variant="h5" gutterBottom>
              {weather.name}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <img
                src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
              />
            </Box>

            <Typography variant="h4" gutterBottom>
              {Math.round(weather.main.temp)}°C
            </Typography>

            <Typography variant="h6">
              {weather.weather[0].main}
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Typography>
                체감 온도: {Math.round(weather.main.feels_like)}°C
              </Typography>
              <Typography>
                습도: {weather.main.humidity}%
              </Typography>
              <Typography>
                풍속: {weather.wind.speed} m/s
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default App;
