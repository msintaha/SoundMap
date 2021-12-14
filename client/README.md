# SoundMap
A vis tool for exploring multi attribute sound datasets

### Setup
- Node version >=12
- Install yarn using `npm i -g yarn`
- Install packages using `yarn install`
- Run the app using `yarn start`
    - Note: for Windows, must use http://localhost:8080/ instead of the default http://0.0.0.0:8080/

### Manual Deployment
- In webpack.prod.js, replace the `<YOUR_FRONTEND_CLIENT>` with the actual domain path
- Run `yarn build`
- Run `yarn production` to serve the app in your domain

## Docker
### Run dev-app locally
- `docker-compose up`
### Run tests locally
- `docker ps` to get container id
- `docker exec -it <container_id> yarn test`
### Run build folder locally
- `docker build .`
- `docker run -it -p 8080:80 <container_id>`
- Visit localhost:8080

## CI/CD
- Create a travis-ci account, add your repository and activate it in settings
- Add AWS environment variables like access_key and secret_key (for deploying in aws)
- For deploying to aws, uncomment the `deploy: ` portion in the .travis.yml file and add in your bucket_name and app_name
