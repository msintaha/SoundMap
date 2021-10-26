import React, { useState } from 'react';

import Overview from '../../components/Overview';
import Header from '../../components/Header';

import * as d3 from 'd3';
import _ from 'lodash';
import { Button } from '@mui/material';


function Dashboard() {
  const [attributeTypes, setAttributeTypes] = useState({});
  const [data, setData] = useState([]);

  const onFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
      const text = e.target.result;
      setData(d3.csvParse(text));
      setAttributeTypes({
        ordinal: ['Stimulus', 'Breed', 'Sex'],
        quantitative: ['Duration', 'Fundamental Frequency'],
        listical: []
      });
    }

    reader.readAsText(file);
  }

  return (
    <React.Fragment>
      <Header />
      <div className="sm-Dashboard">
        <Button
          className="sm-Dashboard-upload"
          size="small"
          variant="contained"
          component="label"
        >
          Upload File
          <input
            onChange={onFileUpload}
            type="file"
            accept=".csv"
            hidden
          />
        </Button>
        <br />
        {(!!data.length && !_.isEmpty(attributeTypes)) && <Overview attributeTypes={attributeTypes} data={data} />}
      </div>
    </React.Fragment>
  );
}

export default Dashboard;
