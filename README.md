## SoundMap: A Visualization tool to explore multi-attribute sound data

![App Interface](./soundmap.png)

### Demo: https://youtu.be/8jrC7JqcD4Y

## Data
https://drive.google.com/file/d/16U_h_fT6FOWxaMhx-mQXEai6l_KmxnuG/view?usp=sharing

## Description
SoundMap is created with ReactJS. We added the library d3 and material-ui (and other supporting libraries like axios for api communication). We use a `Header` component as the toolbar to show soundmap logo and the buttons for manipulating the dashboard. The `Dashboard` is the main page where we show all other chart components like `Overview`, `SummaryView` and `DetailedView`. We mainly use d3 to create beeswarm charts and bar charts from scratch in the `Overview` and `SummaryView` components. We track click events on the dots for showing the detailed view and mouseover events for showing the tooltip over the dots or bars. The detailed view is rendered only when a dot is clicked. We used a skeleton loader as a loading svg whenever the detailed view is re-rendered based on the dot clicks. We added a filter panel which uses material ui components and icons for the form elements like checkboxes, dropdowns, input fields etc. and uses css for showing/hiding the panel. For the multi-view feature, we use react states and CSS to re-arrange the charts in a juxtaposed manner.

SoundMap uses a React client and a Flask server. The server and client communicate via REST API. We use the library axios in ReactJS for calling the backend endpoints. There are two backend endpoints, `/api/generate-spectrogram` and `/api/generate-waveplot`. We use `librosa` and `matplotlib` to render the spectrogram and waveplot based on the request body parameters (file_data and sample_rate) of a particular sound file. The spectrogram and waveplots are sent as base64encoded image to the client. The client renders this base64 image using the `<img />` tag.

Below is the setup instructions of the app server and client. Use two terminal tabs to run the client and server simultaneously.

## Setup

## Server
### Creating virtual environment
**Using conda**
- `conda create --name venv`
- `conda activate venv`
- `conda install --file requirements.txt`

**Using pip**
- Create a virtual env by installing `virtualenv` package from pip
- `virtualenv venv`
- `source venv/bin/activate`
- `pip install -r requirements.txt`

**Running the app**
- `./bootstrap.sh`

## Client
- Make sure to use node version >=12
- Install yarn using `npm i -g yarn`
- Install packages using `yarn install`
- Run the app using `yarn start` and view it in http://localhost:8080/
