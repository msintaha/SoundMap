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
        ordinal: ['stimulus', 'breed', 'sex'],
        quantitative: ['meow_duration', 'est_peak_frequency', 'est_fundamental_mean', 'est_fundamental_min', 'est_fundamental_max'],
        listical: []
      });
    }

    reader.readAsText(file);
  }

  return (
    <React.Fragment>
      <Header onFileUpload={onFileUpload} />
      <div className="sm-Dashboard">
        {(!!data.length && !_.isEmpty(attributeTypes)) && <Overview attributeTypes={attributeTypes} data={data} />}
      </div>
    </React.Fragment>
  );
}

export default Dashboard;
