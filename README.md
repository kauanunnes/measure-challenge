# Measure App

To run this app, you will need to create a .env file, and set variable called GEMINI_API_KEY (you can get one [here](https://ai.google.dev/gemini-api/docs/api-key)).

Your .env file needs be like this:
```env
GEMINI_API_KEY=YOUR_API_KEY_GOES_HERE
```

After .env file created, you can run `docker compose up -d` to start the service. The service will use the 80 port as default, but you can change it adding a new option port in .env file as well.

```env
GEMINI_API_KEY=YOUR_API_KEY_GOES_HERE
PORT=NEW_NUMBER_PORT
```

