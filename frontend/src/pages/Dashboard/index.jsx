import React, { useEffect, useState } from 'react';

import Overview from '../../components/Overview';
import Header from '../../components/Header';
import Service from '../../services/Service';
import { Backdrop, Box, Button, CircularProgress, Checkbox, FormControlLabel, Modal, Fade } from '@mui/material';

import * as d3 from 'd3';
import _ from 'lodash';
import UploadIcon from '@mui/icons-material/UploadFileOutlined';


function Dashboard() {
  const [attributeTypes, setAttributeTypes] = useState({
    ordinal: [],
    quantitative: [],
    listical: []
  });
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [attrs, setAttrs] = useState([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [viewsList, setViewsList] = useState([]);

  const onFileUpload = (event) => {
    onCancel();
    setLoading(true);

    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
      const text = e.target.result;
      const csvData = d3.csvParse(text);
      setData(csvData);
      setAttrs(Object.keys(csvData[0]));
      setOpen(true);
      setLoading(false);
    }

    reader.readAsText(file);
  }

  const setChecked = (event, key, value) => {
    const { checked } = event.target;
    if (checked) {
      setAttributeTypes({ ...attributeTypes, [key]: attributeTypes[key].concat([value]) })
    }  else {
      setAttributeTypes({ ...attributeTypes, [key]: attributeTypes[key].filter(v => v!== value) });
    }
  }

  function onConfirm() {
    setIsConfirmed(true);
    setOpen(false);
    setViewsList([{
      ordinal: attributeTypes.ordinal[0],
      quantitative: attributeTypes.quantitative[0],
      filterBy: attributeTypes.ordinal[1]
    }]);
  }

  function onCancel() {
    setData([]);
    setOpen(false);
    setIsConfirmed(false);
    setAttributeTypes({
      ordinal: [],
      quantitative: [],
      listical: []
    });
  }

  function onAddView(quantitativeAttr) {
    setViewsList([...viewsList, {
      ordinal: attributeTypes.ordinal[0],
      quantitative: quantitativeAttr,
      filterBy: attributeTypes.ordinal[1]
    }]);
  }

  return (
    <div className="sm-Dashboard">
      <Header
        onFileUpload={onFileUpload}
        items={data ? attributeTypes.quantitative : null}
        onItemClick={onAddView}
      />
      {isLoading && <Box sx={{ position: 'absolute', top: '50%', left: '48.5%' }}>
        <CircularProgress disableShrink color="secondary" />
      </Box>}
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Box className="sm-Dashboard-modal">
            <h4>Choose Attribute Types</h4>
            <div className="sm-Dashboard-modalBody">
              <div className="sm-Dashboard-attrContainer">
                <h5>Ordinal Attributes</h5>
                <div className="sm-Dashboard-checkboxes">
                  {attrs.map(v => <FormControlLabel sx={{height: 15}} size="small" control={<Checkbox size="small" onChange={(event) => setChecked(event, 'ordinal', v)} checked={attributeTypes.ordinal.includes(v)} />} label={v} />)}
                </div>
              </div>
              <div className="sm-Dashboard-attrContainer">
                <h5>Quantitative Attributes</h5>
                <div className="sm-Dashboard-checkboxes">
                  {attrs.map(v => <FormControlLabel sx={{height: 15}} size="small" control={<Checkbox size="small" onChange={(event) => setChecked(event, 'quantitative', v)} checked={attributeTypes.quantitative.includes(v)} />} label={v} />)}
                </div>
              </div>
              <div className="sm-Dashboard-attrContainer">
                <h5>Sound Attributes</h5>
                <div className="sm-Dashboard-checkboxes">
                  {attrs.map(v => <FormControlLabel sx={{height: 15}} size="small" control={<Checkbox size="small" onChange={(event) => setChecked(event, 'listical', v)} checked={attributeTypes.listical.includes(v)} />} label={v} />)}
                </div>
              </div>
            </div>
            <div className="sm-Dashboard-modalFooter">
              <Button variant="outlined" color="secondary" onClick={onCancel}>Cancel</Button>
              <Button style={{marginLeft: '4px'}} variant="contained" onClick={onConfirm}>Confirm</Button>
            </div>
          </Box>
        </Fade>
      </Modal>
      <div className="sm-Dashboard-body">
        {(!!data.length && Object.values(attributeTypes).find(v => v.length >= 1)) && isConfirmed ?
          viewsList.map((view, idx) => <Overview key={idx} viewIndex={idx} attributeTypes={attributeTypes} data={data} />) : null
        }
        {!data.length && !isLoading &&
          <div className="sm-Dashboard-empty">
            Get started by uploading a CSV file
            <Box sx={{display: 'flex'}}><UploadIcon fontSize="large" size="large" /></Box>
          </div>
        }
      </div>
    </div>
  );
}



export default Dashboard;
