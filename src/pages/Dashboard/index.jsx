import React, { useState } from 'react';

import Overview from '../../components/Overview';

import * as d3 from 'd3';
import { Alert, Button, Collapse } from '@mui/material';


function Dashboard() {
  const [showAlert, setShowAlert] = useState(false);
  const [data, setData] = useState([]);

  const onFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
      const text = e.target.result;
      setData(d3.csvParse(text));
      setShowAlert(true);
    }

    reader.readAsText(file);
  }

  return (
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
      <Collapse in={showAlert}>
        <Alert severity="success" onClose={() => setShowAlert(false)}>File uploaded successfully</Alert>
      </Collapse>
      {!!data.length && <Overview data={data} />}
    </div>
  );
}

export default Dashboard;
